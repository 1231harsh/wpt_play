window.TOPIC_GROUPS = [
  {
    category: "HTML",
    topics: [
      {
        id: "html-table",
        title: "Table Tag",
        summary: "Understand rows, columns, headings, and how table structure maps to visible cells.",
        points: [
          "A table is built with table, tr, th, and td tags.",
          "th creates heading cells, while td creates regular data cells.",
          "The browser arranges cells into rows automatically based on the HTML structure."
        ],
        files: {
          html: `<div class="demo-card">\n  <h2>Student Scores</h2>\n  <table class="score-table">\n    <tr>\n      <th>Name</th>\n      <th>HTML</th>\n      <th>CSS</th>\n    </tr>\n    <tr>\n      <td>Asha</td>\n      <td>92</td>\n      <td>88</td>\n    </tr>\n    <tr>\n      <td>Ravi</td>\n      <td>85</td>\n      <td>91</td>\n    </tr>\n  </table>\n</div>`,
          css: `body {\n  font-family: Arial, sans-serif;\n  padding: 24px;\n  background: #fffaf2;\n}\n\n.demo-card {\n  max-width: 540px;\n  margin: 0 auto;\n  background: white;\n  padding: 20px;\n  border-radius: 16px;\n  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);\n}\n\n.score-table {\n  width: 100%;\n  border-collapse: collapse;\n}\n\n.score-table th,\n.score-table td {\n  border: 1px solid #d7c8ae;\n  padding: 12px;\n  text-align: left;\n}\n\n.score-table th {\n  background: #1f6f5f;\n  color: white;\n}`,
          js: `// Try adding a new row in the HTML or changing border-collapse in CSS.`
        }
      },
      {
        id: "html-form",
        title: "Form Basics",
        summary: "See how labels, inputs, and buttons create an interactive form structure.",
        points: [
          "label connects text to an input and improves accessibility.",
          "Inputs collect user values; different input types change browser behavior.",
          "A button inside a form usually submits it unless JavaScript prevents that."
        ],
        files: {
          html: `<form class="signup-form" id="signup-form">\n  <h2>Join the Workshop</h2>\n  <label>\n    Name\n    <input type="text" placeholder="Enter your name" />\n  </label>\n  <label>\n    Email\n    <input type="email" placeholder="Enter your email" />\n  </label>\n  <button type="submit">Register</button>\n  <p id="form-message"></p>\n</form>`,
          css: `body {\n  font-family: Arial, sans-serif;\n  background: #f6fbff;\n  padding: 24px;\n}\n\n.signup-form {\n  max-width: 420px;\n  margin: 0 auto;\n  display: grid;\n  gap: 14px;\n  background: white;\n  padding: 24px;\n  border-radius: 18px;\n  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);\n}\n\nlabel {\n  display: grid;\n  gap: 8px;\n}\n\ninput,\nbutton {\n  padding: 12px;\n  border-radius: 10px;\n  border: 1px solid #cfdbe8;\n}\n\nbutton {\n  background: #0c4f43;\n  color: white;\n  border: none;\n}`,
          js: `document.getElementById("signup-form").addEventListener("submit", (event) => {\n  event.preventDefault();\n  document.getElementById("form-message").textContent = "The form submitted without refreshing the page.";\n});`
        }
      }
    ]
  },
  {
    category: "CSS",
    topics: [
      {
        id: "css-flexbox",
        title: "Flexbox",
        summary: "Learn how flexible layout aligns items in a row or column.",
        points: [
          "display: flex turns the container into a flex formatting context.",
          "justify-content controls the main-axis spacing.",
          "align-items controls cross-axis alignment."
        ],
        files: {
          html: `<section class="flex-demo">\n  <div class="box">HTML</div>\n  <div class="box">CSS</div>\n  <div class="box">JS</div>\n</section>`,
          css: `body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  background: linear-gradient(135deg, #f8e9d2, #dff1ea);\n  font-family: Arial, sans-serif;\n}\n\n.flex-demo {\n  display: flex;\n  gap: 16px;\n  justify-content: center;\n  align-items: center;\n  padding: 24px;\n}\n\n.box {\n  width: 120px;\n  height: 120px;\n  border-radius: 20px;\n  display: grid;\n  place-items: center;\n  background: #1f6f5f;\n  color: white;\n  font-size: 1.1rem;\n}`,
          js: `// Change justify-content or align-items to see the layout move.`
        }
      },
      {
        id: "css-grid",
        title: "CSS Grid",
        summary: "Understand two-dimensional layout with rows and columns.",
        points: [
          "display: grid creates a grid container.",
          "grid-template-columns defines the number and size of columns.",
          "Gap creates clean spacing without margin hacks."
        ],
        files: {
          html: `<section class="grid-demo">\n  <article class="card">Header</article>\n  <article class="card">Sidebar</article>\n  <article class="card">Content</article>\n  <article class="card">Footer</article>\n</section>`,
          css: `body {\n  font-family: Arial, sans-serif;\n  background: #fff;\n  padding: 24px;\n}\n\n.grid-demo {\n  display: grid;\n  grid-template-columns: 1fr 2fr;\n  gap: 16px;\n}\n\n.card {\n  min-height: 120px;\n  padding: 18px;\n  background: #ece7ff;\n  border: 1px solid #cfc4ff;\n  border-radius: 18px;\n}`,
          js: `// Try changing grid-template-columns to 1fr 1fr 1fr.`
        }
      }
    ]
  },
  {
    category: "JavaScript",
    topics: [
      {
        id: "js-dom",
        title: "DOM Manipulation",
        summary: "See how JavaScript finds elements and changes text or styles.",
        points: [
          "querySelector finds an element in the document.",
          "Event listeners connect user actions to JavaScript logic.",
          "Changing textContent updates the visible page."
        ],
        files: {
          html: `<section class="dom-demo">\n  <h2 id="headline">Click the button</h2>\n  <button id="change-btn">Change Text</button>\n</section>`,
          css: `body {\n  font-family: Arial, sans-serif;\n  padding: 40px;\n}\n\nbutton {\n  padding: 12px 18px;\n  border: none;\n  border-radius: 999px;\n  background: #1f6f5f;\n  color: white;\n  cursor: pointer;\n}`,
          js: `const button = document.getElementById("change-btn");\nconst headline = document.getElementById("headline");\n\nbutton.addEventListener("click", () => {\n  headline.textContent = "JavaScript changed this text in the DOM.";\n});`
        }
      },
      {
        id: "js-array",
        title: "Array map()",
        summary: "Learn how arrays can transform data into new values or UI fragments.",
        points: [
          "map runs once for each item in the array.",
          "It returns a new array without changing the original.",
          "You can use it to generate HTML from data."
        ],
        files: {
          html: `<section>\n  <h2>Rendered List</h2>\n  <ul id="skill-list"></ul>\n</section>`,
          css: `body {\n  font-family: Arial, sans-serif;\n  padding: 32px;\n}\n\nli {\n  margin-bottom: 10px;\n}`,
          js: `const skills = ["HTML", "CSS", "JavaScript", "React"];\nconst list = document.getElementById("skill-list");\n\nlist.innerHTML = skills\n  .map((skill, index) => \`<li>\${index + 1}. \${skill}</li>\`)\n  .join("");`
        }
      }
    ]
  },
  {
    category: "AJAX",
    topics: [
      {
        id: "ajax-fetch",
        title: "fetch() Basics",
        summary: "Understand asynchronous requests and how data appears without a page reload.",
        points: [
          "fetch returns a promise for a network response.",
          "await response.json() converts JSON text into a JavaScript object.",
          "The page updates after the request finishes."
        ],
        files: {
          html: `<section class="ajax-demo">\n  <h2>Load a message</h2>\n  <button id="load-btn">Fetch Message</button>\n  <pre id="result-box">Waiting for request...</pre>\n</section>`,
          css: `body {\n  font-family: Arial, sans-serif;\n  padding: 30px;\n}\n\nbutton {\n  padding: 10px 16px;\n  background: #0c4f43;\n  color: white;\n  border: none;\n  border-radius: 10px;\n}\n\npre {\n  padding: 14px;\n  background: #f4f7f7;\n  border-radius: 12px;\n}`,
          js: `document.getElementById("load-btn").addEventListener("click", async () => {\n  const resultBox = document.getElementById("result-box");\n  resultBox.textContent = "Loading...";\n\n  const response = await fetch("/api/ping");\n  const data = await response.json();\n  resultBox.textContent = JSON.stringify(data, null, 2);\n});`
        }
      }
    ]
  },
  {
    category: "React",
    topics: [
      {
        id: "react-component",
        title: "Component + State",
        summary: "Watch a React component update the UI when state changes.",
        points: [
          "A component is a function that returns UI.",
          "useState stores values between renders.",
          "Calling the state setter triggers a rerender."
        ],
        files: {
          html: `<div id="root"></div>\n<script src="/vendor/react/react.development.js"></script>\n<script src="/vendor/react-dom/react-dom.development.js"></script>`,
          css: `body {\n  font-family: Arial, sans-serif;\n  padding: 30px;\n  background: #fffaf5;\n}\n\n.react-card {\n  max-width: 420px;\n  padding: 24px;\n  border-radius: 18px;\n  background: white;\n  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.08);\n}\n\nbutton {\n  margin-top: 12px;\n  padding: 10px 16px;\n  border: none;\n  border-radius: 999px;\n  background: #1f6f5f;\n  color: white;\n}`,
          js: `const { useState } = React;\n\nfunction CounterCard() {\n  const [count, setCount] = useState(0);\n\n  return React.createElement(\n    "div",\n    { className: "react-card" },\n    React.createElement("h2", null, "React Counter"),\n    React.createElement("p", null, "Current count: " + count),\n    React.createElement(\n      "button",\n      { onClick: () => setCount(count + 1) },\n      "Increase"\n    )\n  );\n}\n\nconst root = ReactDOM.createRoot(document.getElementById("root"));\nroot.render(React.createElement(CounterCard));`
        }
      }
    ]
  },
  {
    category: "Node",
    topics: [
      {
        id: "node-runtime",
        title: "Node Runtime Idea",
        summary: "See Node concepts explained visually while reading the server-side code.",
        points: [
          "Node runs JavaScript outside the browser.",
          "It is often used for APIs, files, automation, and backend logic.",
          "This preview simulates what a server does because Node itself does not render UI."
        ],
        files: {
          html: `<section class="concept-panel">\n  <h2>Node.js Runtime</h2>\n  <p>The browser preview is showing a concept card, while the code pane explains server-side JavaScript.</p>\n  <div class="flow">\n    <div>Request comes in</div>\n    <div>Node runs JS</div>\n    <div>Response goes out</div>\n  </div>\n</section>`,
          css: `body {\n  font-family: Arial, sans-serif;\n  padding: 30px;\n  background: #eef6ff;\n}\n\n.concept-panel {\n  max-width: 680px;\n  margin: auto;\n  padding: 24px;\n  border-radius: 22px;\n  background: white;\n}\n\n.flow {\n  display: flex;\n  gap: 12px;\n  margin-top: 18px;\n}\n\n.flow div {\n  flex: 1;\n  padding: 16px;\n  background: #d8e9ff;\n  border-radius: 14px;\n  text-align: center;\n}`,
          js: `// Example Node.js code\nconst http = require("http");\n\nconst server = http.createServer((request, response) => {\n  response.writeHead(200, { "Content-Type": "text/plain" });\n  response.end("Hello from Node.js");\n});\n\nserver.listen(3000);`
        }
      }
    ]
  },
  {
    category: "Express",
    topics: [
      {
        id: "express-route",
        title: "Simple Route",
        summary: "Understand how Express defines an endpoint and returns a response.",
        points: [
          "app.get creates a route for GET requests.",
          "req contains request data and res sends the response.",
          "Express makes API creation much simpler than raw Node HTTP."
        ],
        files: {
          html: `<section class="concept-panel">\n  <h2>Express Route</h2>\n  <p>This preview represents what the browser receives after calling an Express endpoint.</p>\n  <code>GET /api/hello -> { message: "Hi from Express" }</code>\n</section>`,
          css: `body {\n  font-family: Arial, sans-serif;\n  background: #f4fbf8;\n  padding: 30px;\n}\n\n.concept-panel {\n  max-width: 650px;\n  margin: auto;\n  padding: 24px;\n  background: white;\n  border-radius: 20px;\n  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.07);\n}\n\ncode {\n  display: inline-block;\n  margin-top: 12px;\n  padding: 10px 12px;\n  border-radius: 10px;\n  background: #edf7f2;\n}`,
          js: `const express = require("express");\nconst app = express();\n\napp.get("/api/hello", (req, res) => {\n  res.json({ message: "Hi from Express" });\n});\n\napp.listen(3000);`
        }
      }
    ]
  }
];
