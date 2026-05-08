import { ToDo, Item } from "./core.ts";

const file = process.argv[2];
const command = process.argv[3];

if (!file) {
  console.error("Por favor, forneça o caminho do arquivo.");
  process.exit(1);
}

const todo = new ToDo(file);

if (command === "add") {
  const itemDescription = process.argv[4];
  
  if (!itemDescription) {
    console.error("Por favor, forneça uma descrição para o item.");
    process.exit(1);
  }

  const item = new Item(itemDescription);
  await todo.addItem(item);
  console.log(`Item "${itemDescription}" adicionado com sucesso!`);
  process.exit(0);
}

if (command === "list") {
  const items = await todo.getItems();

  if (items.length === 0) {
    console.log("Nenhum item na lista.");
    process.exit(0);
  }

  console.log("Lista de itens:");
  items.forEach((item, index) =>
    console.log(`${index}: ${item.toJSON().description}`)
  );

  process.exit(0);
}

  if (command === "update") {
  const indexNumber = process.argv[4];
  const newDescription = process.argv[5];

  if (!indexNumber || !newDescription) {
    console.error("Forneça o índice e a nova descrição.");
    process.exit(1);
  }

  const index = Number(indexNumber);

  if (isNaN(index)) {
    console.error("O índice deve ser um número.");
    process.exit(1);
  }

  const newItem = new Item(newDescription);

  try {
    await todo.updateItem(index, newItem);
    console.log(`Item no índice ${index} atualizado com sucesso!`);
    process.exit(0);
  } catch (error) {
    console.error("Erro ao atualizar item:", error.message);
    process.exit(1);
  }

}

if (command === "remove") {
 const indexNumber = process.argv[4];

  if (!indexNumber) {
    console.error("Por favor, forneça o índice do item que você deseja remover.");
    process.exit(1);
  }

  const index = Number(indexNumber);

  if (isNaN(index)) {
    console.error("O índice deve ser um número.");
    process.exit(1);
  }

  try {
    await todo.removeItem(index);
    console.log(`Item no índice ${index} removido com sucesso!`);
    process.exit(0);
  } catch (error) {
    console.error("Erro ao remover item:", error.message);
    process.exit(1);
  }

}

console.error("Comando desconhecido. Use 'add', 'list', 'update' ou 'remove'.");
process.exit(1);