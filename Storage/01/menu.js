document.addEventListener("DOMContentLoaded", function () {
  // Menu buttons
  const menuItem1 = document.getElementById("menu-item-1");
  const menuItem2 = document.getElementById("menu-item-2");
  
  // Content div
  const content = document.getElementById("content");
  
  // Event listeners for buttons
  menuItem1.addEventListener("click", function () {
      content.innerHTML = "<p>You clicked on <strong>Content 1</strong>. Here's some information about it!</p>";
  });
  
  menuItem2.addEventListener("click", function () {
      content.innerHTML = "<p>You clicked on <strong>Content 2</strong>. Here's some different information about that!</p>";
  });
});
