/**
 * Title: employee.interface.ts
 * Modified by: Shane Hingtgen
 * Date: 8/24/23
 */

// interface to help build our form
import { Item } from './item.interface';

export interface Employee {
  empId: number;
  todo: Item[];
  done: Item[];
}
