/**
 * Author: Võ Anh Ben - CE190709
 * Unit test kiem thu FUMiniHotelSystem
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSeed, defaultSettings } from '../src/data/seed.js';

test('seed has valid hotel room types, rooms and customers', () => {
  const seed = createSeed();
  assert.equal(Array.isArray(seed.roomTypes), true);
  assert.equal(seed.roomTypes.length >= 4, true);

  assert.equal(Array.isArray(seed.rooms), true);
  assert.equal(seed.rooms.length >= 4, true);

  assert.equal(Array.isArray(seed.customers), true);
  assert.equal(seed.customers.length >= 1, true);
});

test('default settings contain hotel brand information', () => {
  assert.equal(defaultSettings.hotelName, 'FUMiniHotel');
  assert.equal(defaultSettings.displayName, 'Hotel Staff');
});
