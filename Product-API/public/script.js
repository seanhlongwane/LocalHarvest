
async function loadProducts() {
  try {
    const response = await fetch("/api/products");
    const products = await response.json();
    const productList = document.getElementById("product-list");
    productList.innerHTML = "";
    
    products.forEach((product) => {
      const productCard = `
        <div class="product">
          <h3>${product.name}</h3>
          <p>Price: $${product.price}</p>
          <p>Quantity: ${product.quantity}</p>
        </div>
      `;
      productList.innerHTML += productCard;
    });
  } catch (error) {
    console.error("Error loading products:", error);
  }
}

document.getElementById("add-product-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  
  const name = document.getElementById("product-name").value;
  const price = parseFloat(document.getElementById("product-price").value);
  const quantity = parseInt(document.getElementById("product-quantity").value);

  try {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, price, quantity }),
    });

    const result = await response.json();
    console.log("Product added:", result);
    loadProducts();
  } catch (error) {
    console.error("Error adding product:", error);
  }
});

// Set up SSE connection
const evtSource = new EventSource("/api/updates");
evtSource.onmessage = (event) => {
  const products = JSON.parse(event.data);
  const productList = document.getElementById("product-list");
  productList.innerHTML = "";
  
  products.forEach((product) => {
    const productCard = `
      <div class="product">
        <h3>${product.name}</h3>
        <p>Price: $${product.price}</p>
        <p>Quantity: ${product.quantity}</p>
      </div>
    `;
    productList.innerHTML += productCard;
  });
};

// Initial load
document.addEventListener("DOMContentLoaded", loadProducts);
