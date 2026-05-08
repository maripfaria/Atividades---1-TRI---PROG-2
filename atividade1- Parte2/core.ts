export class Item {
  private description: string;

  constructor(description: string) {
    this.description = description;
  }

  updateDescription(newDescription: string) {
    this.description = newDescription;
  }

  toJSON() {
    return { description: this.description };
  }
}

export class ToDo {
  private filepath: string;
  private items: Promise<Item[]>;

  constructor(filepath: string) {
    this.filepath = filepath;
    this.items = this.loadFromFile();
  }

  private async saveToFile(): Promise<boolean> {
    try {
      const items = await this.items;
      const file = Bun.file(this.filepath);
      const data = JSON.stringify(items, null, 2);
      await Bun.write(file, data); //Adicionei await aqui pq o codigo nao tava rodando no terminal
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      return false;
    }
  }

  private async loadFromFile(): Promise<Item[]> {
    const file = Bun.file(this.filepath);
    
    if (!(await file.exists())) {
      return [];
    }
    
    const data = await file.text();
    
    if (!data || data.trim() === "") {
      return [];
    }
    
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) 
        ? parsed.map((itemData: any) => new Item(itemData.description))
        : [];
    } catch (error) {
      console.warn(`⚠️ JSON inválido em "${this.filepath}". Iniciando vazio.`);
      return [];
    }
  }

  async addItem(item: Item): Promise<void> {
    const items = await this.items;
    items.push(item);
    await this.saveToFile(); // tbm adicionei await
  }

  async getItems(): Promise<Item[]> {
    return await this.items;
  }

  async updateItem(index: number, newItem: Item): Promise<void> {
    const items = await this.items;
    if (index < 0 || index >= items.length) 
      throw new Error('Index out of bounds');
    items[index] = newItem;
    await this.saveToFile(); // tbm adicionei await
  }

  async removeItem(index: number): Promise<void> {
    const items = await this.items;
    if (index < 0 || index >= items.length) 
      throw new Error('Index out of bounds');
    items.splice(index, 1);
    await this.saveToFile(); //tbm adicionei await
  }

  async findItemByDescription(description: string): Promise<Item | undefined> {
    const items = await this.items;
    return items.find(item => item.toJSON().description === description);    
  }

  async findItemByIndex(index: number): Promise<Item | undefined> {
    const items = await this.items;
    if (index < 0 || index >= items.length) 
      throw new Error('Index out of bounds');
    return items[index];
  }
}