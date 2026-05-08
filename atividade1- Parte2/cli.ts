import { ToDo, Item } from './core.ts';

const file = process.argv[2]
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
  items.forEach((item, index) => console.log(`${index}: ${item.toJSON().description}`));
  process.exit(0);
}


if (command === "update") {
  const indexArg = process.argv[4];
  const newDescription = process.argv[5];
  

  if (!indexArg || !newDescription) {
    console.error("Uso: bun cli.ts <arquivo.json> update <índice> <nova descrição>");
    console.error("Exemplo: bun cli.ts lista.json update 0 \"Comprar leite\"");
    process.exit(1);
  }

  const index = parseInt(indexArg, 10);
  
  if (isNaN(index) || index < 0) {
    console.error("Índice inválido. Use um número inteiro não negativo.");
    process.exit(1);
  }

  try {
    const updatedItem = new Item(newDescription);
    
    await todo.updateItem(index, updatedItem);
    
    console.log(`Item ${index} atualizado para: "${newDescription}"`);
    process.exit(0);
  } catch (error: any) {
    console.error(`Erro ao atualizar: ${error.message}`);
    process.exit(1);
  }
}

if (command === "remove") {
  const indexArg = process.argv[4];
 
  if (!indexArg) {
    console.error("Uso: bun cli.ts <arquivo.json> remove <índice>");
    console.error("Exemplo: bun cli.ts lista.json remove 0");
    process.exit(1);
  }

  const index = parseInt(indexArg, 10);
  
  if (isNaN(index) || index < 0) {
    console.error("Índice inválido. Use um número inteiro não negativo.");
    process.exit(1);
  }

  try {
    const itemToRemove = await todo.findItemByIndex(index);
    
    await todo.removeItem(index);
    
    console.log(`Item removido: "${itemToRemove?.toJSON().description}"`);
    process.exit(0);
  } catch (error: any) {
    console.error(`Erro ao remover: ${error.message}`);
    process.exit(1);
  }
}

console.error("Comando desconhecido. Use 'add', 'list', 'update' ou 'remove'.");
process.exit(1);
