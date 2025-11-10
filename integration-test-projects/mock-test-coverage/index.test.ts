import {
  describe,
  expect,
  it
} from 'vitest'
import { coveredFunction } from '.'

describe('mock test', ()=>{
  it('should return true', ()=>{
    expect(coveredFunction()).toBeTruthy();
  })
})