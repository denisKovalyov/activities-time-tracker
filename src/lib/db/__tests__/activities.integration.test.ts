import { beforeEach, describe, expect, it } from 'vitest';

import {
  dbCreateActivity,
  dbDeleteActivity,
  dbListActivities,
  dbMoveActivities,
  dbUpdateActivity,
} from '@/lib/db/activities';
import { dbStartTimer } from '@/lib/db/time-entries';
import { clearDatabase, createUser, query } from '@/test/integration/helpers';

let userId: string;
let otherUserId: string;

const create = (name: string, user = userId) =>
  dbCreateActivity(user, { name, color: 'ffffff', icon: 'circle' });

const move = (id: string, previousId: string | null) =>
  dbMoveActivities(userId, [{ id, previousId }]);

const names = async () =>
  (await dbListActivities(userId)).map(({ name }) => name);

beforeEach(async () => {
  await clearDatabase();
  userId = await createUser('user@test.com');
  otherUserId = await createUser('other@test.com');
});

describe('createActivity', () => {
  it('adds activities to the end of the list', async () => {
    await create('A');
    await create('B');
    await create('C');

    expect(await names()).toEqual(['A', 'B', 'C']);
  });

  it('gives simultaneous creates different positions', async () => {
    await Promise.all(['A', 'B', 'C', 'D', 'E'].map((name) => create(name)));

    const positions = (await dbListActivities(userId)).map((a) => a.position);
    expect(new Set(positions).size).toBe(5);
  });
});

describe('moveActivities', () => {
  it('moves the last activity to the top by updating only its row', async () => {
    const a = await create('A');
    const b = await create('B');
    const c = await create('C');

    await move(c.id, null);

    expect(await names()).toEqual(['C', 'A', 'B']);
    const [rowA, rowB] = await query<{ position: string }>(
      'SELECT position FROM activity WHERE id = ANY($1) ORDER BY name',
      [[a.id, b.id]],
    );
    expect(rowA.position).toBe(a.position);
    expect(rowB.position).toBe(b.position);
  });

  it('moves to the middle and to the end', async () => {
    const a = await create('A');
    const b = await create('B');
    const c = await create('C');

    await move(a.id, b.id);
    expect(await names()).toEqual(['B', 'A', 'C']);

    await move(b.id, c.id);
    expect(await names()).toEqual(['A', 'C', 'B']);
  });

  it('gives simultaneous moves to the same place different positions', async () => {
    const a = await create('A');
    await create('B');
    const c = await create('C');
    const d = await create('D');

    await Promise.all([move(c.id, a.id), move(d.id, a.id)]);

    const list = await dbListActivities(userId);
    expect(new Set(list.map((x) => x.position)).size).toBe(4);
    expect(list[0].name).toBe('A');
  });

  it('keeps positions short after many moves', async () => {
    const a = await create('A');
    const b = await create('B');

    for (let i = 0; i < 50; i++) {
      await move(i % 2 ? a.id : b.id, null);
    }

    const lengths = (await dbListActivities(userId)).map(
      (x) => x.position.length,
    );
    expect(Math.max(...lengths)).toBeLessThan(6);
  });

  it('applies all moves or none', async () => {
    const a = await create('A');
    const b = await create('B');
    const c = await create('C');
    await dbDeleteActivity(userId, a.id);

    await expect(
      dbMoveActivities(userId, [
        { id: c.id, previousId: null },
        { id: b.id, previousId: a.id },
      ]),
    ).rejects.toThrow();

    expect(await names()).toEqual(['B', 'C']);
  });

  it('fails the whole batch when a moved activity does not exist', async () => {
    await create('A');
    const b = await create('B');
    const c = await create('C');
    await dbDeleteActivity(userId, b.id);

    await expect(
      dbMoveActivities(userId, [
        { id: c.id, previousId: null },
        { id: b.id, previousId: null },
      ]),
    ).rejects.toThrow();

    expect(await names()).toEqual(['A', 'C']);
  });

  it('fails when the previous activity does not exist', async () => {
    const a = await create('A');
    const b = await create('B');
    await dbDeleteActivity(userId, a.id);

    await expect(move(b.id, a.id)).rejects.toThrow();
  });
});

describe('updateActivity', () => {
  it('updates only the given fields', async () => {
    const a = await create('A');

    const updated = await dbUpdateActivity(userId, a.id, { color: '000000' });

    expect(updated).toMatchObject({
      name: 'A',
      color: '000000',
      icon: 'circle',
    });
  });
});

describe('deleteActivity', () => {
  it('removes time entries of the activity', async () => {
    const a = await create('A');
    await dbStartTimer(userId, a.id);

    await dbDeleteActivity(userId, a.id);

    expect(await query('SELECT * FROM time_entry')).toEqual([]);
  });
});

describe('other users', () => {
  it("can't change or see the user's activities", async () => {
    const other = await create('X', otherUserId);

    expect(
      await dbUpdateActivity(userId, other.id, { name: 'changed' }),
    ).toBeUndefined();
    await expect(move(other.id, null)).rejects.toThrow();
    await dbDeleteActivity(userId, other.id);

    expect(await dbListActivities(userId)).toEqual([]);
    expect((await dbListActivities(otherUserId))[0].name).toBe('X');
  });
});
