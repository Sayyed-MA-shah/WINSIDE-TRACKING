import { Product } from '../types';

// Import the catalog bundle data
const catalogData = {
  "products": [
    {
      "id": 6,
      "article": "BGA-1012",
      "name": "Boxing gloves amok",
      "category_id": 1,
      "shelf_no": 0,
      "wholesale_price": 35.0,
      "retail_price": 49.99,
      "cost_before": 12.0,
      "cost_after": 16.0,
      "category": {
        "id": 1,
        "name": "Boxing Gloves"
      },
      "variants": [
        {
          "id": 6,
          "product_id": 6,
          "color_id": 1,
          "size_id": 1,
          "quantity": 9,
          "article": "BGA-1012",
          "name": "Boxing gloves amok",
          "color": {
            "id": 1,
            "name": "Black"
          },
          "size": {
            "id": 1,
            "name": "10oz"
          }
        },
        {
          "id": 7,
          "product_id": 6,
          "color_id": 1,
          "size_id": 2,
          "quantity": 10,
          "article": "BGA-1012",
          "name": "Boxing gloves amok",
          "color": {
            "id": 1,
            "name": "Black"
          },
          "size": {
            "id": 2,
            "name": "12oz"
          }
        },
        {
          "id": 8,
          "product_id": 6,
          "color_id": 1,
          "size_id": 3,
          "quantity": 13,
          "article": "BGA-1012",
          "name": "Boxing gloves amok",
          "color": {
            "id": 1,
            "name": "Black"
          },
          "size": {
            "id": 3,
            "name": "14oz"
          }
        },
        {
          "id": 9,
          "product_id": 6,
          "color_id": 1,
          "size_id": 4,
          "quantity": 8,
          "article": "BGA-1012",
          "name": "Boxing gloves amok",
          "color": {
            "id": 1,
            "name": "Black"
          },
          "size": {
            "id": 4,
            "name": "16oz"
          }
        }
      ]
    },
    {
      "id": 7,
      "article": "BGC-1011",
      "name": "Boxing gloves ClassX",
      "category_id": 1,
      "shelf_no": 0,
      "wholesale_price": 41.0,
      "retail_price": 69.99,
      "cost_before": 14.0,
      "cost_after": 18.0,
      "category": {
        "id": 1,
        "name": "Boxing Gloves"
      },
      "variants": [
        {
          "id": 10,
          "product_id": 7,
          "color_id": 1,
          "size_id": 1,
          "quantity": 4,
          "article": "BGC-1011",
          "name": "Boxing gloves ClassX",
          "color": {
            "id": 1,
            "name": "Black"
          },
          "size": {
            "id": 1,
            "name": "10oz"
          }
        },
        {
          "id": 11,
          "product_id": 7,
          "color_id": 1,
          "size_id": 2,
          "quantity": 4,
          "article": "BGC-1011",
          "name": "Boxing gloves ClassX",
          "color": {
            "id": 1,
            "name": "Black"
          },
          "size": {
            "id": 2,
            "name": "12oz"
          }
        },
        {
          "id": 12,
          "product_id": 7,
          "color_id": 1,
          "size_id": 3,
          "quantity": 37,
          "article": "BGC-1011",
          "name": "Boxing gloves ClassX",
          "color": {
            "id": 1,
            "name": "Black"
          },
          "size": {
            "id": 3,
            "name": "14oz"
          }
        },
        {
          "id": 13,
          "product_id": 7,
          "color_id": 1,
          "size_id": 4,
          "quantity": 18,
          "article": "BGC-1011",
          "name": "Boxing gloves ClassX",
          "color": {
            "id": 1,
            "name": "Black"
          },
          "size": {
            "id": 4,
            "name": "16oz"
          }
        }
      ]
    },
    {
      "id": 8,
      "article": "BGE-1013",
      "name": "Boxing Gloves Endoor",
      "category_id": 1,
      "shelf_no": 0,
      "wholesale_price": 49.0,
      "retail_price": 89.99,
      "cost_before": 18.0,
      "cost_after": 23.0,
      "category": {
        "id": 1,
        "name": "Boxing Gloves"
      },
      "variants": [
        {
          "id": 14,
          "product_id": 8,
          "color_id": 2,
          "size_id": 1,
          "quantity": 0,
          "article": "BGE-1013",
          "name": "Boxing Gloves Endoor",
          "color": {
            "id": 2,
            "name": "WHITE"
          },
          "size": {
            "id": 1,
            "name": "10oz"
          }
        },
        {
          "id": 15,
          "product_id": 8,
          "color_id": 2,
          "size_id": 2,
          "quantity": 0,
          "article": "BGE-1013",
          "name": "Boxing Gloves Endoor",
          "color": {
            "id": 2,
            "name": "WHITE"
          },
          "size": {
            "id": 2,
            "name": "12oz"
          }
        },
        {
          "id": 16,
          "product_id": 8,
          "color_id": 2,
          "size_id": 3,
          "quantity": 0,
          "article": "BGE-1013",
          "name": "Boxing Gloves Endoor",
          "color": {
            "id": 2,
            "name": "WHITE"
          },
          "size": {
            "id": 3,
            "name": "14oz"
          }
        },
        {
          "id": 17,
          "product_id": 8,
          "color_id": 2,
          "size_id": 4,
          "quantity": 0,
          "article": "BGE-1013",
          "name": "Boxing Gloves Endoor",
          "color": {
            "id": 2,
            "name": "WHITE"
          },
          "size": {
            "id": 4,
            "name": "16oz"
          }
        },
        {
          "id": 18,
          "product_id": 8,
          "color_id": 2,
          "size_id": 5,
          "quantity": 0,
          "article": "BGE-1013",
          "name": "Boxing Gloves Endoor",
          "color": {
            "id": 2,
            "name": "WHITE"
          },
          "size": {
            "id": 5,
            "name": "18oz"
          }
        },
        {
          "id": 19,
          "product_id": 8,
          "color_id": 2,
          "size_id": 6,
          "quantity": 0,
          "article": "BGE-1013",
          "name": "Boxing Gloves Endoor",
          "color": {
            "id": 2,
            "name": "WHITE"
          },
          "size": {
            "id": 6,
            "name": "20oz"
          }
        }
      ]
    },
    {
      "id": 9,
      "article": "BGH-1015",
      "name": "Boxing Gloves Horse",
      "category_id": 1,
      "shelf_no": 0,
      "wholesale_price": 70.0,
      "retail_price": 150.0,
      "cost_before": 20.0,
      "cost_after": 27.0,
      "category": {
        "id": 1,
        "name": "Boxing Gloves"
      },
      "variants": [
        {
          "id": 20,
          "product_id": 9,
          "color_id": 3,
          "size_id": 1,
          "quantity": 0,
          "article": "BGH-1015",
          "name": "Boxing Gloves Horse",
          "color": {
            "id": 3,
            "name": "RED"
          },
          "size": {
            "id": 1,
            "name": "10oz"
          }
        }
      ]
    },
    {
      "id": 10,
      "article": "BGK-1016",
      "name": "Boxing Gloves Knock",
      "category_id": 1,
      "shelf_no": 0,
      "wholesale_price": 40.0,
      "retail_price": 69.99,
      "cost_before": 16.0,
      "cost_after": 20.0,
      "category": {
        "id": 1,
        "name": "Boxing Gloves"
      },
      "variants": [
        {
          "id": 21,
          "product_id": 10,
          "color_id": 5,
          "size_id": 1,
          "quantity": 0,
          "article": "BGK-1016",
          "name": "Boxing Gloves Knock",
          "color": {
            "id": 5,
            "name": "Black & Red"
          },
          "size": {
            "id": 1,
            "name": "10oz"
          }
        },
        {
          "id": 22,
          "product_id": 10,
          "color_id": 5,
          "size_id": 2,
          "quantity": 0,
          "article": "BGK-1016",
          "name": "Boxing Gloves Knock",
          "color": {
            "id": 5,
            "name": "Black & Red"
          },
          "size": {
            "id": 2,
            "name": "12oz"
          }
        },
        {
          "id": 23,
          "product_id": 10,
          "color_id": 5,
          "size_id": 3,
          "quantity": 0,
          "article": "BGK-1016",
          "name": "Boxing Gloves Knock",
          "color": {
            "id": 5,
            "name": "Black & Red"
          },
          "size": {
            "id": 3,
            "name": "14oz"
          }
        },
        {
          "id": 24,
          "product_id": 10,
          "color_id": 5,
          "size_id": 4,
          "quantity": 0,
          "article": "BGK-1016",
          "name": "Boxing Gloves Knock",
          "color": {
            "id": 5,
            "name": "Black & Red"
          },
          "size": {
            "id": 4,
            "name": "16oz"
          }
        }
      ]
    },
    {
      "id": 11,
      "article": "BGI-1017",
      "name": "Boxing Gloves Impact",
      "category_id": 1,
      "shelf_no": 0,
      "wholesale_price": 45.0,
      "retail_price": 79.99,
      "cost_before": 16.0,
      "cost_after": 20.0,
      "category": {
        "id": 1,
        "name": "Boxing Gloves"
      },
      "variants": [
        {
          "id": 25,
          "product_id": 11,
          "color_id": 7,
          "size_id": 1,
          "quantity": 0,
          "article": "BGI-1017",
          "name": "Boxing Gloves Impact",
          "color": {
            "id": 7,
            "name": "MAROON"
          },
          "size": {
            "id": 1,
            "name": "10oz"
          }
        },
        {
          "id": 26,
          "product_id": 11,
          "color_id": 7,
          "size_id": 2,
          "quantity": 0,
          "article": "BGI-1017",
          "name": "Boxing Gloves Impact",
          "color": {
            "id": 7,
            "name": "MAROON"
          },
          "size": {
            "id": 2,
            "name": "12oz"
          }
        },
        {
          "id": 27,
          "product_id": 11,
          "color_id": 7,
          "size_id": 3,
          "quantity": 0,
          "article": "BGI-1017",
          "name": "Boxing Gloves Impact",
          "color": {
            "id": 7,
            "name": "MAROON"
          },
          "size": {
            "id": 3,
            "name": "14oz"
          }
        },
        {
          "id": 28,
          "product_id": 11,
          "color_id": 7,
          "size_id": 4,
          "quantity": 0,
          "article": "BGI-1017",
          "name": "Boxing Gloves Impact",
          "color": {
            "id": 7,
            "name": "MAROON"
          },
          "size": {
            "id": 4,
            "name": "16oz"
          }
        },
        {
          "id": 29,
          "product_id": 11,
          "color_id": 8,
          "size_id": 1,
          "quantity": 0,
          "article": "BGI-1017",
          "name": "Boxing Gloves Impact",
          "color": {
            "id": 8,
            "name": "PURPLE"
          },
          "size": {
            "id": 1,
            "name": "10oz"
          }
        },
        {
          "id": 30,
          "product_id": 11,
          "color_id": 8,
          "size_id": 2,
          "quantity": 0,
          "article": "BGI-1017",
          "name": "Boxing Gloves Impact",
          "color": {
            "id": 8,
            "name": "PURPLE"
          },
          "size": {
            "id": 2,
            "name": "12oz"
          }
        },
        {
          "id": 31,
          "product_id": 11,
          "color_id": 8,
          "size_id": 3,
          "quantity": 0,
          "article": "BGI-1017",
          "name": "Boxing Gloves Impact",
          "color": {
            "id": 8,
            "name": "PURPLE"
          },
          "size": {
            "id": 3,
            "name": "14oz"
          }
        },
        {
          "id": 32,
          "product_id": 11,
          "color_id": 8,
          "size_id": 4,
          "quantity": 0,
          "article": "BGI-1017",
          "name": "Boxing Gloves Impact",
          "color": {
            "id": 8,
            "name": "PURPLE"
          },
          "size": {
            "id": 4,
            "name": "16oz"
          }
        }
      ]
    },
    {
      "id": 12,
      "article": "BGB-1019",
      "name": "Boxing Gloves BP",
      "category_id": 1,
      "shelf_no": 0,
      "wholesale_price": 59.99,
      "retail_price": 130.0,
      "cost_before": 16.0,
      "cost_after": 20.0,
      "category": {
        "id": 1,
        "name": "Boxing Gloves"
      },
      "variants": [
        {
          "id": 33,
          "product_id": 12,
          "color_id": 9,
          "size_id": 1,
          "quantity": 0,
          "article": "BGB-1019",
          "name": "Boxing Gloves BP",
          "color": {
            "id": 9,
            "name": "GREEN"
          },
          "size": {
            "id": 1,
            "name": "10oz"
          }
        },
        {
          "id": 34,
          "product_id": 12,
          "color_id": 9,
          "size_id": 2,
          "quantity": 0,
          "article": "BGB-1019",
          "name": "Boxing Gloves BP",
          "color": {
            "id": 9,
            "name": "GREEN"
          },
          "size": {
            "id": 2,
            "name": "12oz"
          }
        },
        {
          "id": 35,
          "product_id": 12,
          "color_id": 9,
          "size_id": 3,
          "quantity": 0,
          "article": "BGB-1019",
          "name": "Boxing Gloves BP",
          "color": {
            "id": 9,
            "name": "GREEN"
          },
          "size": {
            "id": 3,
            "name": "14oz"
          }
        },
        {
          "id": 36,
          "product_id": 12,
          "color_id": 9,
          "size_id": 4,
          "quantity": 0,
          "article": "BGB-1019",
          "name": "Boxing Gloves BP",
          "color": {
            "id": 9,
            "name": "GREEN"
          },
          "size": {
            "id": 4,
            "name": "16oz"
          }
        }
      ]
    },
    {
      "id": 13,
      "article": "HGB-2011",
      "name": "Head Guard Brag",
      "category_id": 2,
      "shelf_no": 0,
      "wholesale_price": 69.0,
      "retail_price": 110.0,
      "cost_before": 18.0,
      "cost_after": 24.0,
      "category": {
        "id": 2,
        "name": "HEAD GUARD"
      },
      "variants": [
        {
          "id": 37,
          "product_id": 13,
          "color_id": 10,
          "size_id": 14,
          "quantity": 0,
          "article": "HGB-2011",
          "name": "Head Guard Brag",
          "color": {
            "id": 10,
            "name": "WHITE & GOLD"
          },
          "size": {
            "id": 14,
            "name": "S/M"
          }
        },
        {
          "id": 38,
          "product_id": 13,
          "color_id": 10,
          "size_id": 15,
          "quantity": 0,
          "article": "HGB-2011",
          "name": "Head Guard Brag",
          "color": {
            "id": 10,
            "name": "WHITE & GOLD"
          },
          "size": {
            "id": 15,
            "name": "L/XL"
          }
        },
        {
          "id": 39,
          "product_id": 13,
          "color_id": 11,
          "size_id": 14,
          "quantity": 0,
          "article": "HGB-2011",
          "name": "Head Guard Brag",
          "color": {
            "id": 11,
            "name": "BLACK & GOLD"
          },
          "size": {
            "id": 14,
            "name": "S/M"
          }
        },
        {
          "id": 40,
          "product_id": 13,
          "color_id": 11,
          "size_id": 15,
          "quantity": 0,
          "article": "HGB-2011",
          "name": "Head Guard Brag",
          "color": {
            "id": 11,
            "name": "BLACK & GOLD"
          },
          "size": {
            "id": 15,
            "name": "L/XL"
          }
        }
      ]
    },
    {
      "id": 14,
      "article": "BGV-1019",
      "name": "Boxing Gloves Vexa",
      "category_id": 1,
      "shelf_no": 0,
      "wholesale_price": 16.0,
      "retail_price": 29.99,
      "cost_before": 7.0,
      "cost_after": 10.0,
      "category": {
        "id": 1,
        "name": "Boxing Gloves"
      },
      "variants": [
        {
          "id": 41,
          "product_id": 14,
          "color_id": 12,
          "size_id": 16,
          "quantity": 0,
          "article": "BGV-1019",
          "name": "Boxing Gloves Vexa",
          "color": {
            "id": 12,
            "name": "PINK"
          },
          "size": {
            "id": 16,
            "name": "4oz"
          }
        },
        {
          "id": 42,
          "product_id": 14,
          "color_id": 12,
          "size_id": 17,
          "quantity": 0,
          "article": "BGV-1019",
          "name": "Boxing Gloves Vexa",
          "color": {
            "id": 12,
            "name": "PINK"
          },
          "size": {
            "id": 17,
            "name": "6oz"
          }
        },
        {
          "id": 43,
          "product_id": 14,
          "color_id": 12,
          "size_id": 18,
          "quantity": 0,
          "article": "BGV-1019",
          "name": "Boxing Gloves Vexa",
          "color": {
            "id": 12,
            "name": "PINK"
          },
          "size": {
            "id": 18,
            "name": "8oz"
          }
        },
        {
          "id": 44,
          "product_id": 14,
          "color_id": 12,
          "size_id": 1,
          "quantity": 0,
          "article": "BGV-1019",
          "name": "Boxing Gloves Vexa",
          "color": {
            "id": 12,
            "name": "PINK"
          },
          "size": {
            "id": 1,
            "name": "10oz"
          }
        },
        {
          "id": 45,
          "product_id": 14,
          "color_id": 12,
          "size_id": 2,
          "quantity": 0,
          "article": "BGV-1019",
          "name": "Boxing Gloves Vexa",
          "color": {
            "id": 12,
            "name": "PINK"
          },
          "size": {
            "id": 2,
            "name": "12oz"
          }
        },
        {
          "id": 46,
          "product_id": 14,
          "color_id": 12,
          "size_id": 3,
          "quantity": 0,
          "article": "BGV-1019",
          "name": "Boxing Gloves Vexa",
          "color": {
            "id": 12,
            "name": "PINK"
          },
          "size": {
            "id": 3,
            "name": "14oz"
          }
        },
        {
          "id": 47,
          "product_id": 14,
          "color_id": 12,
          "size_id": 4,
          "quantity": 0,
          "article": "BGV-1019",
          "name": "Boxing Gloves Vexa",
          "color": {
            "id": 12,
            "name": "PINK"
          },
          "size": {
            "id": 4,
            "name": "16oz"
          }
        }
      ]
    },
    {
      "id": 16,
      "article": "HGH-2015",
      "name": "Head Guard Heed",
      "category_id": 2,
      "shelf_no": 0,
      "wholesale_price": 22.99,
      "retail_price": 39.99,
      "cost_before": 8.0,
      "cost_after": 12.0,
      "category": {
        "id": 2,
        "name": "HEAD GUARD"
      },
      "variants": [
        {
          "id": 56,
          "product_id": 16,
          "color_id": 10,
          "size_id": 9,
          "quantity": 19,
          "article": "HGH-2015",
          "name": "Head Guard Heed",
          "color": {
            "id": 10,
            "name": "WHITE & GOLD"
          },
          "size": {
            "id": 9,
            "name": "S"
          }
        },
        {
          "id": 57,
          "product_id": 16,
          "color_id": 10,
          "size_id": 10,
          "quantity": 38,
          "article": "HGH-2015",
          "name": "Head Guard Heed",
          "color": {
            "id": 10,
            "name": "WHITE & GOLD"
          },
          "size": {
            "id": 10,
            "name": "M"
          }
        },
        {
          "id": 58,
          "product_id": 16,
          "color_id": 10,
          "size_id": 11,
          "quantity": 19,
          "article": "HGH-2015",
          "name": "Head Guard Heed",
          "color": {
            "id": 10,
            "name": "WHITE & GOLD"
          },
          "size": {
            "id": 11,
            "name": "L"
          }
        }
      ]
    },
    {
      "id": 17,
      "article": "GGP-2031",
      "name": "Groin Guard Pro",
      "category_id": 3,
      "shelf_no": 0,
      "wholesale_price": 29.99,
      "retail_price": 59.99,
      "cost_before": 12.0,
      "cost_after": 17.0,
      "category": {
        "id": 3,
        "name": "Groin Guards"
      },
      "variants": [
        {
          "id": 59,
          "product_id": 17,
          "color_id": 1,
          "size_id": 9,
          "quantity": 0,
          "article": "GGP-2031",
          "name": "Groin Guard Pro",
          "color": {
            "id": 1,
            "name": "Black"
          },
          "size": {
            "id": 9,
            "name": "S"
          }
        },
        {
          "id": 60,
          "product_id": 17,
          "color_id": 1,
          "size_id": 10,
          "quantity": 0,
          "article": "GGP-2031",
          "name": "Groin Guard Pro",
          "color": {
            "id": 1,
            "name": "Black"
          },
          "size": {
            "id": 10,
            "name": "M"
          }
        },
        {
          "id": 61,
          "product_id": 17,
          "color_id": 1,
          "size_id": 11,
          "quantity": 0,
          "article": "GGP-2031",
          "name": "Groin Guard Pro",
          "color": {
            "id": 1,
            "name": "Black"
          },
          "size": {
            "id": 11,
            "name": "L"
          }
        },
        {
          "id": 62,
          "product_id": 17,
          "color_id": 1,
          "size_id": 12,
          "quantity": 0,
          "article": "GGP-2031",
          "name": "Groin Guard Pro",
          "color": {
            "id": 1,
            "name": "Black"
          },
          "size": {
            "id": 12,
            "name": "XL"
          }
        }
      ]
    },
    {
      "id": 18,
      "article": "GGP-2032",
      "name": "Groin Guard Pro",
      "category_id": 3,
      "shelf_no": 0,
      "wholesale_price": 29.99,
      "retail_price": 59.99,
      "cost_before": 14.0,
      "cost_after": 20.0,
      "category": {
        "id": 3,
        "name": "Groin Guards"
      },
      "variants": [
        {
          "id": 63,
          "product_id": 18,
          "color_id": 11,
          "size_id": 9,
          "quantity": 0,
          "article": "GGP-2032",
          "name": "Groin Guard Pro",
          "color": {
            "id": 11,
            "name": "BLACK & GOLD"
          },
          "size": {
            "id": 9,
            "name": "S"
          }
        },
        {
          "id": 64,
          "product_id": 18,
          "color_id": 11,
          "size_id": 10,
          "quantity": 0,
          "article": "GGP-2032",
          "name": "Groin Guard Pro",
          "color": {
            "id": 11,
            "name": "BLACK & GOLD"
          },
          "size": {
            "id": 10,
            "name": "M"
          }
        },
        {
          "id": 65,
          "product_id": 18,
          "color_id": 11,
          "size_id": 11,
          "quantity": 0,
          "article": "GGP-2032",
          "name": "Groin Guard Pro",
          "color": {
            "id": 11,
            "name": "BLACK & GOLD"
          },
          "size": {
            "id": 11,
            "name": "L"
          }
        },
        {
          "id": 66,
          "product_id": 18,
          "color_id": 11,
          "size_id": 12,
          "quantity": 0,
          "article": "GGP-2032",
          "name": "Groin Guard Pro",
          "color": {
            "id": 11,
            "name": "BLACK & GOLD"
          },
          "size": {
            "id": 12,
            "name": "XL"
          }
        }
      ]
    },
    {
      "id": 19,
      "article": "CSM-2041",
      "name": "Cup Supporter Metal",
      "category_id": 3,
      "shelf_no": 0,
      "wholesale_price": 10.0,
      "retail_price": 18.99,
      "cost_before": 4.0,
      "cost_after": 6.0,
      "category": {
        "id": 3,
        "name": "Groin Guards"
      },
      "variants": [
        {
          "id": 67,
          "product_id": 19,
          "color_id": 1,
          "size_id": 9,
          "quantity": 0,
          "article": "CSM-2041",
          "name": "Cup Supporter Metal",
          "color": {
            "id": 1,
            "name": "Black"
          },
          "size": {
            "id": 9,
            "name": "S"
          }
        },
        {
          "id": 68,
          "product_id": 19,
          "color_id": 1,
          "size_id": 10,
          "quantity": 0,
          "article": "CSM-2041",
          "name": "Cup Supporter Metal",
          "color": {
            "id": 1,
            "name": "Black"
          },
          "size": {
            "id": 10,
            "name": "M"
          }
        },
        {
          "id": 69,
          "product_id": 19,
          "color_id": 1,
          "size_id": 11,
          "quantity": 0,
          "article": "CSM-2041",
          "name": "Cup Supporter Metal",
          "color": {
            "id": 1,
            "name": "Black"
          },
          "size": {
            "id": 11,
            "name": "L"
          }
        },
        {
          "id": 70,
          "product_id": 19,
          "color_id": 5,
          "size_id": 9,
          "quantity": 0,
          "article": "CSM-2041",
          "name": "Cup Supporter Metal",
          "color": {
            "id": 5,
            "name": "Black & Red"
          },
          "size": {
            "id": 9,
            "name": "S"
          }
        },
        {
          "id": 71,
          "product_id": 19,
          "color_id": 5,
          "size_id": 10,
          "quantity": 0,
          "article": "CSM-2041",
          "name": "Cup Supporter Metal",
          "color": {
            "id": 5,
            "name": "Black & Red"
          },
          "size": {
            "id": 10,
            "name": "M"
          }
        },
        {
          "id": 72,
          "product_id": 19,
          "color_id": 5,
          "size_id": 11,
          "quantity": 0,
          "article": "CSM-2041",
          "name": "Cup Supporter Metal",
          "color": {
            "id": 5,
            "name": "Black & Red"
          },
          "size": {
            "id": 11,
            "name": "L"
          }
        }
      ]
    },
    {
      "id": 20,
      "article": "CSP-2042",
      "name": "Cup Supporter Poly",
      "category_id": 3,
      "shelf_no": 0,
      "wholesale_price": 4.99,
      "retail_price": 9.99,
      "cost_before": 0.0,
      "cost_after": 0.0,
      "category": {
        "id": 3,
        "name": "Groin Guards"
      },
      "variants": [
        {
          "id": 73,
          "product_id": 20,
          "color_id": 2,
          "size_id": 9,
          "quantity": 0,
          "article": "CSP-2042",
          "name": "Cup Supporter Poly",
          "color": {
            "id": 2,
            "name": "WHITE"
          },
          "size": {
            "id": 9,
            "name": "S"
          }
        },
        {
          "id": 74,
          "product_id": 20,
          "color_id": 2,
          "size_id": 10,
          "quantity": 0,
          "article": "CSP-2042",
          "name": "Cup Supporter Poly",
          "color": {
            "id": 2,
            "name": "WHITE"
          },
          "size": {
            "id": 10,
            "name": "M"
          }
        },
        {
          "id": 75,
          "product_id": 20,
          "color_id": 2,
          "size_id": 11,
          "quantity": 0,
          "article": "CSP-2042",
          "name": "Cup Supporter Poly",
          "color": {
            "id": 2,
            "name": "WHITE"
          },
          "size": {
            "id": 11,
            "name": "L"
          }
        }
      ]
    },
    {
      "id": 21,
      "article": "SPP-2051",
      "name": "Shin instep PRO",
      "category_id": 4,
      "shelf_no": 0,
      "wholesale_price": 35.99,
      "retail_price": 49.99,
      "cost_before": 12.0,
      "cost_after": 18.0,
      "category": {
        "id": 4,
        "name": "Shininsteps"
      },
      "variants": [
        {
          "id": 76,
          "product_id": 21,
          "color_id": 3,
          "size_id": 7,
          "quantity": 0,
          "article": "SPP-2051",
          "name": "Shin instep PRO",
          "color": {
            "id": 3,
            "name": "RED"
          },
          "size": {
            "id": 7,
            "name": "XS"
          }
        }
      ]
    },
    {
      "id": 22,
      "article": "SPT-2052",
      "name": "Shin Instep Training",
      "category_id": 4,
      "shelf_no": 0,
      "wholesale_price": 29.99,
      "retail_price": 44.99,
      "cost_before": 7.0,
      "cost_after": 14.0,
      "category": {
        "id": 4,
        "name": "Shininsteps"
      },
      "variants": []
    }
  ]
};

// Transform the JSON data to match our application's product structure
export function transformJsonToProducts(): Product[] {
  return catalogData.products
    .filter(product => product && product.id && product.article) // Filter out invalid products
    .map(product => {
      // Get unique brand based on article prefix - all products go to byko for now
      const getBrand = (article: string): 'greenhil' | 'harican' | 'byko' => {
        return 'byko'; // All products assigned to byko brand as requested
      };

      // Process variants safely
      const processedVariants = (product.variants || [])
        .filter(variant => variant && variant.color && variant.size) // Filter out invalid variants
        .map(variant => ({
          id: `variant-${variant.product_id}-${variant.color_id}-${variant.size_id}`,
          productId: `prod-${product.id}`,
          sku: `${product.article}-${variant.color.name.replace(/\s+/g, '')}-${variant.size.name}`,
          attributes: {
            Color: variant.color.name,
            Size: variant.size.name
          },
          qty: variant.quantity || 0
        }));

      // Determine attributes based on available variants
      const attributes: string[] = [];
      if (processedVariants.some(v => v.attributes.Color)) attributes.push('Color');
      if (processedVariants.some(v => v.attributes.Size)) attributes.push('Size');

      return {
        id: `prod-${product.id}`,
        article: product.article,
        title: product.name,
        category: product.category?.name || 'Uncategorized',
        brand: getBrand(product.article),
        taxable: true,
        attributes,
        mediaMain: undefined,
        archived: false,
        shelfNumber: product.shelf_no || 0, // Set shelf number to 0 as requested
        wholesale: product.wholesale_price || 0,
        retail: product.retail_price || 0,
        club: (product.retail_price || 0) * 0.85, // 15% discount for club pricing
        costBefore: product.cost_before || 0,
        costAfter: product.cost_after || 0,
        variants: processedVariants,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    })
    .filter(product => product.article && product.title); // Final filter for valid products
}

// Export the transformed products
export const jsonMigratedProducts = transformJsonToProducts();

// Summary statistics
export const migrationSummary = {
  totalProducts: jsonMigratedProducts.length,
  totalVariants: jsonMigratedProducts.reduce((sum, product) => sum + product.variants.length, 0),
  productsByCategory: jsonMigratedProducts.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>),
  productsByBrand: jsonMigratedProducts.reduce((acc, product) => {
    acc[product.brand] = (acc[product.brand] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)
};

console.log('🎉 JSON Migration Summary:', migrationSummary);
