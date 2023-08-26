/**
 * Title: item.interface.ts
 * Modified by: Shane Hingtgen
 * Date: 8/24/23
 */

// interfaces to help build our form
export interface Category {
  categoryName: string;
  backgroundColor: string;
}

export interface Item {
  _id?: string; //optional property
  text: string;
  category: Category;
}
