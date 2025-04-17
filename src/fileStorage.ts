import { promises as fs } from "fs";
import path from "path";
import { IStorage } from "@tonconnect/sdk";

export default class FileStorage implements IStorage {
  private filePath: string;

  constructor(fileName: string) {
    // 파일 경로 설정 (현재 디렉토리 + 파일명)
    this.filePath = path.join(__dirname, fileName);
  }

  private async readFile(): Promise<Record<string, string>> {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return {}; // 파일이 없으면 빈 객체 반환
    }
  }

  private async writeFile(data: Record<string, string>): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  async setItem(key: string, value: string): Promise<void> {
    const data = await this.readFile();
    data[key] = value;
    await this.writeFile(data);
  }

  async getItem(key: string): Promise<string | null> {
    const data = await this.readFile();
    return data[key] || null;
  }

  async removeItem(key: string): Promise<void> {
    const data = await this.readFile();
    delete data[key];
    await this.writeFile(data);
  }
}
