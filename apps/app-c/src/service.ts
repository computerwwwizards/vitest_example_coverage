/**
 * Service functions (UNTESTED - control group)
 */

export class UserService {
  private users: Array<{ id: number; name: string; email: string }> = [];

  addUser(name: string, email: string): number {
    const id = this.users.length + 1;
    this.users.push({ id, name, email });
    return id;
  }

  getUserById(id: number): { id: number; name: string; email: string } | null {
    return this.users.find(user => user.id === id) || null;
  }

  getAllUsers(): Array<{ id: number; name: string; email: string }> {
    return [...this.users];
  }

  updateUser(id: number, updates: Partial<{ name: string; email: string }>): boolean {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;

    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return true;
  }

  deleteUser(id: number): boolean {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;

    this.users.splice(userIndex, 1);
    return true;
  }
}