import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { applyMigrations, as, count, createUsers, seedAll, USERS } from "./helpers";

let db: PGlite;

beforeAll(async () => {
  db = new PGlite();
  await applyMigrations(db);
  await createUsers(db);
  await seedAll(db);
});

afterAll(async () => {
  await db.close();
});

describe("migration và seed", () => {
  it("nạp đủ 61 ô, 5 chặng, 5 line, 51 đường nối, 14 đề xuất, 10 thương hiệu", async () => {
    expect(await count(db, "public.journey_nodes")).toBe(61);
    expect(await count(db, "public.journey_stages")).toBe(5);
    expect(await count(db, "public.journey_lines")).toBe(5);
    expect(await count(db, "public.journey_edges")).toBe(51);
    expect(await count(db, "public.journey_edges where proposed")).toBe(14);
    expect(await count(db, "public.brands")).toBe(10);
  });

  it("mọi dòng journey_* nạp từ file nguồn ở trạng thái proposed", async () => {
    expect(await count(db, "public.journey_nodes where status = 'proposed'")).toBe(61);
    expect(await count(db, "public.journey_stages where status = 'proposed'")).toBe(5);
    expect(await count(db, "public.journey_lines where status = 'proposed'")).toBe(5);
  });

  it("gắn đúng thương hiệu cho ô và để trống cho ô không có thương hiệu", async () => {
    const res = await db.query<{ code: string; slug: string | null }>(
      `select n.code, b.slug from public.journey_nodes n left join public.brands b on b.id = n.brand_id
       where n.code in ('n06', 'e01', 'p02', 'n30', 'ea_gap1') order by n.code`,
    );
    expect(Object.fromEntries(res.rows.map((r) => [r.code, r.slug]))).toEqual({
      ea_gap1: null,
      e01: "vmg-e-academy",
      n06: "vmt",
      n30: null,
      p02: "vmg-tesol",
    });
  });

  it("thương hiệu thành viên trỏ về vmg", async () => {
    expect(await count(db, "public.brands where kind = 'member' and parent_id is not null")).toBe(9);
  });

  it("hồ sơ tự tạo khi có người dùng Auth, mặc định staff", async () => {
    const res = await db.query<{ id: string; role: string }>(`select id, role from public.profiles`);
    const roles = Object.fromEntries(res.rows.map((r) => [r.id, r.role]));
    expect(roles[USERS.admin]).toBe("admin");
    expect(roles[USERS.staff]).toBe("staff");
    expect(roles[USERS.guest]).toBe("guest");
  });
});

describe("is_usable (spec 4.2)", () => {
  const usable = async (status: string, from: string | null, to: string | null, notBefore: string | null, today: string) =>
    (
      await db.query<{ r: boolean }>(
        `select public.is_usable($1::public.content_status, $2::date, $3::date, $4::date, $5::date) as r`,
        [status, from, to, notBefore, today],
      )
    ).rows[0]!.r;

  it("chỉ effective mới dùng được", async () => {
    for (const status of ["draft", "in_review", "proposed", "withheld", "superseded", "expired", "archived"]) {
      expect(await usable(status, "2027-01-01", null, null, "2027-02-01")).toBe(false);
    }
    expect(await usable("effective", "2027-01-01", null, null, "2027-02-01")).toBe(true);
  });

  it("effective_from rỗng hoặc ở tương lai thì chưa dùng được", async () => {
    expect(await usable("effective", null, null, null, "2027-02-01")).toBe(false);
    expect(await usable("effective", "2027-02-02", null, null, "2027-02-01")).toBe(false);
    expect(await usable("effective", "2027-02-01", null, null, "2027-02-01")).toBe(true);
  });

  it("effective_to là ngày cuối còn dùng được", async () => {
    expect(await usable("effective", "2027-01-01", "2027-02-01", null, "2027-02-01")).toBe(true);
    expect(await usable("effective", "2027-01-01", "2027-01-31", null, "2027-02-01")).toBe(false);
  });

  it("not_before chặn đến đúng ngày", async () => {
    expect(await usable("effective", "2027-01-01", null, "2027-03-01", "2027-02-28")).toBe(false);
    expect(await usable("effective", "2027-01-01", null, "2027-03-01", "2027-03-01")).toBe(true);
  });
});

describe("RLS: hành trình khách hàng", () => {
  it("nhân viên không thấy gì khi toàn bộ còn proposed (bảng gốc và view)", async () => {
    await as(db, USERS.staff, async () => {
      expect(await count(db, "public.journey_nodes")).toBe(0);
      expect(await count(db, "public.v_usable_journey_nodes")).toBe(0);
      expect(await count(db, "public.v_usable_journey_stages")).toBe(0);
      expect(await count(db, "public.v_usable_journey_lines")).toBe(0);
      expect(await count(db, "public.v_usable_journey_edges")).toBe(0);
    });
  });

  it("editor và admin đọc đủ bảng gốc", async () => {
    for (const user of [USERS.editor, USERS.admin]) {
      await as(db, user, async () => {
        expect(await count(db, "public.journey_nodes")).toBe(61);
        expect(await count(db, "public.journey_edges")).toBe(51);
      });
    }
  });

  it("anon không đọc được view lẫn bảng", async () => {
    await as(db, null, async () => {
      await expect(db.query(`select * from public.v_usable_journey_nodes`)).rejects.toThrow(/permission denied/);
      await expect(db.query(`select * from public.journey_nodes`)).rejects.toThrow(/permission denied/);
    });
  });

  it("tài khoản bị khóa, guest mất quyền ngay dù ô đã effective", async () => {
    await db.exec(
      `update public.journey_nodes set status = 'effective', effective_from = public.today_vn() - 1 where code = 'n01'`,
    );
    for (const user of [USERS.inactive, USERS.guest]) {
      await as(db, user, async () => {
        expect(await count(db, "public.v_usable_journey_nodes")).toBe(0);
      });
    }
    for (const user of [USERS.staff, USERS.backoffice]) {
      await as(db, user, async () => {
        expect(await count(db, "public.v_usable_journey_nodes")).toBe(1);
      });
    }
  });

  it("view chỉ hiện đường nối khi cả hai đầu mút dùng được", async () => {
    await as(db, USERS.staff, async () => {
      expect(await count(db, "public.v_usable_journey_edges")).toBe(0);
    });
    await db.exec(
      `update public.journey_nodes set status = 'effective', effective_from = public.today_vn() - 1 where code = 'n02'`,
    );
    await as(db, USERS.staff, async () => {
      const res = await db.query<{ kind: string }>(`select kind from public.v_usable_journey_edges`);
      expect(res.rows).toEqual([{ kind: "sequence" }]);
    });
  });

  it("view không có verify_note, brand_note và ẩn mốc thời gian chưa xác nhận", async () => {
    await db.exec(
      `update public.journey_nodes set status = 'effective', effective_from = public.today_vn() - 1 where code in ('p04', 'p05', 'e03')`,
    );
    await as(db, USERS.staff, async () => {
      const cols = await db.query<{ column_name: string }>(
        `select column_name from information_schema.columns where table_name = 'v_usable_journey_nodes'`,
      );
      const names = cols.rows.map((c) => c.column_name);
      expect(names).not.toContain("verify_note");
      expect(names).not.toContain("brand_note");

      const notes = await db.query<{ code: string; timed_notes: { text: string }[] }>(
        `select code, timed_notes from public.v_usable_journey_nodes where code in ('p04', 'p05')`,
      );
      const byCode = Object.fromEntries(notes.rows.map((r) => [r.code, r.timed_notes]));
      // p04: needs_confirm = true nên ẩn. p05: ra mắt mềm 28/10/2026 chỉ hiện từ ngày đó.
      expect(byCode.p04).toEqual([]);
      const today = (await db.query<{ d: string }>(`select public.today_vn()::text as d`)).rows[0]!.d;
      expect(byCode.p05).toHaveLength(today >= "2026-10-28" ? 1 : 0);
    });
  });

  it("chỉ admin ghi được vào journey_*", async () => {
    await as(db, USERS.staff, async () => {
      await expect(
        db.query(`insert into public.journey_meta (key, value) values ('x', '{}'::jsonb)`),
      ).rejects.toThrow(/row-level security/);
      const res = await db.query(`update public.journey_nodes set product_name = 'X' where code = 'n01'`);
      expect(res.affectedRows).toBe(0);
    });
    await as(db, USERS.editor, async () => {
      const res = await db.query(`update public.journey_nodes set product_name = 'X' where code = 'n01'`);
      expect(res.affectedRows).toBe(0);
    });
    await as(db, USERS.admin, async () => {
      const res = await db.query(`update public.journey_nodes set description = description where code = 'n01'`);
      expect(res.affectedRows).toBe(1);
    });
  });

  it("brand_owner thấy ô của thương hiệu được gán và không thấy ô khác", async () => {
    await as(db, USERS.owner, async () => {
      expect(await count(db, "public.journey_nodes")).toBe(0);
    });
    await db.exec(
      `insert into public.brand_owners (user_id, brand_id) select '${USERS.owner}', id from public.brands where slug = 'vmg-tesol'`,
    );
    await as(db, USERS.owner, async () => {
      const res = await db.query<{ code: string }>(`select code from public.journey_nodes`);
      expect(res.rows).toEqual([{ code: "p02" }]);
    });
  });
});

describe("RLS: nền tảng", () => {
  it("nhân viên không tự nâng vai trò của mình", async () => {
    await as(db, USERS.staff, async () => {
      const res = await db.query(`update public.profiles set role = 'admin' where id = '${USERS.staff}'`);
      expect(res.affectedRows).toBe(0);
    });
    const role = await db.query<{ role: string }>(`select role from public.profiles where id = '${USERS.staff}'`);
    expect(role.rows[0]!.role).toBe("staff");
  });

  it("nhân viên chỉ thấy hồ sơ của mình, admin thấy tất cả", async () => {
    await as(db, USERS.staff, async () => {
      expect(await count(db, "public.profiles")).toBe(1);
    });
    await as(db, USERS.admin, async () => {
      expect(await count(db, "public.profiles")).toBe(7);
    });
  });

  it("thương hiệu draft ẩn với nhân viên, hiện với editor; hiện cho nhân viên khi effective", async () => {
    await as(db, USERS.staff, async () => {
      expect(await count(db, "public.brands")).toBe(0);
    });
    await as(db, USERS.editor, async () => {
      expect(await count(db, "public.brands")).toBe(10);
    });
    await db.exec(`update public.brands set release_status = 'effective', effective_from = public.today_vn() where slug = 'vmg'`);
    await as(db, USERS.staff, async () => {
      expect(await count(db, "public.brands")).toBe(1);
    });
  });

  it("brands đang withheld bởi not_before thì không dùng được", async () => {
    await db.exec(
      `update public.brands set release_status = 'effective', effective_from = public.today_vn(),
         not_before = public.today_vn() + 30 where slug = 'vmg-ielts'`,
    );
    await as(db, USERS.staff, async () => {
      expect(await count(db, "public.brands where slug = 'vmg-ielts'")).toBe(0);
    });
  });

  it("cờ tính năng: thành viên đọc, chỉ admin ghi", async () => {
    await db.exec(`insert into public.feature_flags (key, value) values ('vimi_enabled', 'false'::jsonb)`);
    await as(db, USERS.staff, async () => {
      expect(await count(db, "public.feature_flags")).toBe(1);
      const res = await db.query(`update public.feature_flags set value = 'true'::jsonb`);
      expect(res.affectedRows).toBe(0);
    });
    await as(db, USERS.admin, async () => {
      const res = await db.query(`update public.feature_flags set value = 'true'::jsonb`);
      expect(res.affectedRows).toBe(1);
    });
  });

  it("centers: thành viên đọc, chỉ admin ghi", async () => {
    await as(db, USERS.staff, async () => {
      await expect(
        db.query(`insert into public.centers (code, name_display) values ('X', 'X')`),
      ).rejects.toThrow(/row-level security/);
    });
    await as(db, USERS.admin, async () => {
      await db.query(`insert into public.centers (code, name_display) values ('TEST', 'Trung tâm thử')`);
    });
    await as(db, USERS.staff, async () => {
      expect(await count(db, "public.centers")).toBe(1);
    });
  });
});

describe("audit_log", () => {
  it("ghi lại thay đổi kèm người thực hiện, chỉ admin đọc", async () => {
    await as(db, USERS.admin, async () => {
      const res = await db.query<{ actor_id: string | null }>(
        `select actor_id from public.audit_log where entity_type = 'centers' and action = 'insert'`,
      );
      expect(res.rows).toEqual([{ actor_id: USERS.admin }]);
    });
    await as(db, USERS.staff, async () => {
      expect(await count(db, "public.audit_log")).toBe(0);
    });
  });

  it("không sửa, không xóa, không truncate được", async () => {
    await expect(db.exec(`update public.audit_log set action = 'x'`)).rejects.toThrow(/chỉ được thêm/);
    await expect(db.exec(`delete from public.audit_log`)).rejects.toThrow(/chỉ được thêm/);
    await expect(db.exec(`truncate public.audit_log`)).rejects.toThrow(/chỉ được thêm/);
  });
});
