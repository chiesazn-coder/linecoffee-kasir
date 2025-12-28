export const SIZES = [
    { key: "250", label: "250ml" },
    { key: "500", label: "500ml" },
    { key: "1000", label: "1L" },
  ];
  
  export const MENU = [
    {
      category: "ITEMICANO",
      items: [
        { name: "original", prices: { "250": 9000, "500": 18000, "1000": 35000 } },
        { name: "klasik", prices: { "250": 10000, "500": 20000, "1000": 40000 } },
        { name: "bold", prices: { "250": 12000, "500": 23000, "1000": 45000 } },
      ],
    },
    {
      category: "C'MONG",
      items: [
        { name: "light", prices: { "250": 15000, "500": 28000, "1000": 55000 } },
        { name: "classic", prices: { "250": 16000, "500": 31000, "1000": 60000 } },
        { name: "bold", prices: { "250": 17000, "500": 33000, "1000": 65000 } },
      ],
    },
    {
      category: "ES BONbon",
      items: [
        { name: "light", prices: { "250": 14000, "500": 26000, "1000": 50000 } },
        { name: "classic", prices: { "250": 15000, "500": 28000, "1000": 55000 } },
        { name: "premium", prices: { "250": 16000, "500": 31000, "1000": 60000 } },
      ],
    },
    {
      category: "ENDOLITA",
      items: [
        { name: "light", prices: { "250": 15000, "500": 28000, "1000": 55000 } },
        { name: "classic", prices: { "250": 16000, "500": 31000, "1000": 60000 } },
        { name: "premium", prices: { "250": 17000, "500": 33000, "1000": 65000 } },
      ],
    },
    {
      category: "MACHIATO CARAMEL",
      items: [
        { name: "classic", prices: { "250": 20000, "500": 38000, "1000": 70000 } },
        { name: "premium", prices: { "250": 22000, "500": 42000, "1000": 80000 } },
      ],
    },
    {
      category: "TARAMATCHA",
      items: [
        { name: "classic", prices: { "250": 16000, "500": 30000, "1000": 58000 } },
        { name: "premium", prices: { "250": 17000, "500": 32000, "1000": 60000 } },
      ],
    },
    {
      category: "BARIMATCHA",
      items: [
        { name: "classic", prices: { "250": 17000, "500": 32000, "1000": 60000 } },
        { name: "premium", prices: { "250": 18000, "500": 34000, "1000": 65000 } },
      ],
    },
    {
      category: "ORIGINAL LATTE",
      items: [
        { name: "classic", prices: { "250": 17000, "500": 30000, "1000": 58000 } },
        { name: "premium", prices: { "250": 20000, "500": 37000, "1000": 70000 } },
      ],
    },
  ];
  
  export function rupiah(n) {
    return new Intl.NumberFormat("id-ID").format(n);
  }
  