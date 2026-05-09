import { ToDo } from "./core";
import { Item } from "./core";

const filepath = "./lista.json";
const todo = new ToDo(filepath);
const port = 3000;


function logRequest(method: string, pathname: string, status: number) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${method} ${pathname} → ${status}`);
}

const server = Bun.serve({
  port,
  async fetch(request: Request) {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;
    const method = request.method;
    let responseStatus = 200;

    try {
      // GET /items 
      if (pathname === "/items" && method === "GET") {
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        
        const allItems = await todo.getItems();
        const itemsData = allItems.map(item => item.toJSON());
        const startIndex = (page - 1) * limit;
        const paginatedItems = itemsData.slice(startIndex, startIndex + limit);
        
        responseStatus = 200;
        logRequest(method, pathname, responseStatus);
        return Response.json({
          data: paginatedItems,
          pagination: {
            page,
            limit,
            total: itemsData.length,
            totalPages: Math.ceil(itemsData.length / limit)
          }
        });
      }

      if (pathname === "/items/buscar" && method === "GET") {
        const nome = searchParams.get("nome")?.toLowerCase();
        
        if (!nome) {
          responseStatus = 400;
          logRequest(method, pathname, responseStatus);
          return Response.json({ error: "Paramenter 'name' is required" }, { status: 400 });
        }
        
        const allItems = await todo.getItems();
        const filtered = allItems
          .filter(item => item.toJSON().description.toLowerCase().includes(nome))
          .map(item => item.toJSON());
        
        responseStatus = 200;
        logRequest(method, pathname, responseStatus);
        return Response.json({ data: filtered, count: filtered.length });
      }

      // POST /items 
      if (pathname === "/items" && method === "POST") {
        try {
          const body = await request.json();
          const { description } = body;
          
     if (!description || typeof description !== "string" || description.trim() === "") {
            responseStatus = 400;
            logRequest(method, pathname, responseStatus);
            return Response.json({ error: "The 'description' field is required and must be a non-empty string."}, {status: 400 });
          }

          const item = new Item(description);
          await todo.addItem(item);
          
          responseStatus = 201;
          logRequest(method, pathname, responseStatus);
          return Response.json({ message: "Item added successfully", item: item.toJSON() }, { status: 201 });
        } catch (error) {
          responseStatus = 500;
          logRequest(method, pathname, responseStatus);
          return Response.json({ error: "Failed to add item" }, { status: 500 });
        }
      }

      //PUT 
      if (pathname === "/items" && method === "PUT") {
        try {
          const index = parseInt(searchParams.get("index") || "", 10);
          
          if (isNaN(index) || index < 0) {
            responseStatus = 400;
            logRequest(method, pathname, responseStatus);
            return Response.json({ error: "Invalid index parameter" }, { status: 400 });
          }

          const body = await request.json();
          const { description } = body;

          if (!description || typeof description !== "string" || description.trim() === "") {
            responseStatus = 400;
            logRequest(method, pathname, responseStatus);
           return Response.json({ error: "Field 'description' is required and must be a non-empty string" }, { status: 400 });
          }

          const currentItems = await todo.getItems();
          const existingIndex = currentItems.findIndex(
            item => item.toJSON().description.toLowerCase() === description.toLowerCase()
          );
          
          if (existingIndex !== -1 && existingIndex !== index) {
            responseStatus = 409;
            logRequest(method, pathname, responseStatus);
            return Response.json({ 
              error: "Conflict", 
              message:  "An item with this description already exists."
            }, { status: 409 });
          }

          const item = new Item(description);
          await todo.updateItem(index, item);

          responseStatus = 200;
          logRequest(method, pathname, responseStatus);
          return Response.json({ message: "Item updated successfully", item: item.toJSON() });
        } catch (error: any) {
          if (error.message === "Index out of bounds") {
            responseStatus = 400;
            logRequest(method, pathname, responseStatus);
            return Response.json({ error: error.message }, { status: 400 });
          }
          responseStatus = 500;
          logRequest(method, pathname, responseStatus);
          return Response.json({ error: "Failed to update item" }, { status: 500 });
        }
      }

      //DELETE 
      if (pathname === "/items" && method === "DELETE") {
        try {
          const index = parseInt(searchParams.get("index") || "", 10);
          
          if (isNaN(index) || index < 0) {
            responseStatus = 400;
            logRequest(method, pathname, responseStatus);
            return Response.json({ error: "Invalid index parameter" }, { status: 400 });
          }

          await todo.removeItem(index);
          
          responseStatus = 200;
          logRequest(method, pathname, responseStatus);
          return Response.json({ message: "Item removed successfully" });
        } catch (error: any) {
          if (error.message === "Index out of bounds") {
            responseStatus = 400;
            logRequest(method, pathname, responseStatus);
            return Response.json({ error: error.message }, { status: 400 });
          }
          responseStatus = 500;
          logRequest(method, pathname, responseStatus);
          return Response.json({ error: "Failed to remove item" }, { status: 500 });
        }
      }

      responseStatus = 404;
      logRequest(method, pathname, responseStatus);
      return Response.json({ error: "Not found" }, { status: 404 });

    } catch (err) {
      responseStatus = 500;
      logRequest(method, pathname, responseStatus);
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }
  }
});

console.log(`Servidor rodando em http://localhost:${port}`);