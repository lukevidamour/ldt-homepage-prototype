/* Prototype data.
   Products, prices and images come from the LIVE lakedistricttweed.com store
   (public products.json, read 6 Oct 2026).
   The "vendor" lines are a PROPOSED data convention ("Valley · Farm") built from
   live product descriptions and tags. Confirm them with LDT before use.
   The best-seller selection is a placeholder: real sales data is unknown. */
window.LDT = {
  bestsellers: [
    { title: "Haweswater Throw", vendor: "Haweswater · Naddle Farm", price: "From £170.00", img: "haweswater-throw" },
    { title: "Coniston Throw", vendor: "Coniston · Nibthwaite Grange", price: "From £170.00", img: "coniston-throw" },
    { title: "Ullswater Tweed", vendor: "Ullswater · Racy Ghyll Farm", price: "£70.00 per metre", img: "ullswater-tweed" },
    { title: "Langdale Throw", vendor: "Langdale · Harry Place Farm", price: "From £170.00", img: "langdale-throw" },
    { title: "Tweed Cushion, Medium", vendor: "Sewn in the Lake District", price: "£55.00", img: "cushion-medium" },
    { title: "Ullswater Herdwick Smock", vendor: "Ullswater · Herdwick wool", price: "£225.00", img: "ullswater-smock" },
    { title: "Shepherd's Bag", vendor: "Lake District Tweed", price: "£75.00", img: "shepherds-bag" },
    { title: "Valley Soaps", vendor: "Lake District Tweed", price: "From £7.00", img: "valley-soaps" }
  ],
  /* Order follows the Option 3 palette (VI p.24); Windermere has no palette colour yet. */
  valleys: ["Eskdale", "Haweswater", "Thirlmere", "Wasdale", "Ullswater", "Langdale", "Grasmere",
            "Ennerdale", "Duddon", "Borrowdale", "Buttermere", "Coniston", "Windermere", "All cloth"]
};
