export class Money {
  private constructor(private readonly _cents: number) {}

  static fromCents(cents: number): Money {
    return new Money(Math.round(cents));
  }

  static fromBRL(reais: number): Money {
    return new Money(Math.round(reais * 100));
  }

  static zero(): Money {
    return new Money(0);
  }

  get cents(): number {
    return this._cents;
  }

  get reais(): number {
    return this._cents / 100;
  }

  format(): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(this.reais);
  }

  formatCompact(): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
    }).format(this.reais);
  }

  add(other: Money): Money {
    return Money.fromCents(this._cents + other._cents);
  }

  subtract(other: Money): Money {
    return Money.fromCents(this._cents - other._cents);
  }

  isZero(): boolean {
    return this._cents === 0;
  }

  isPositive(): boolean {
    return this._cents > 0;
  }

  equals(other: Money): boolean {
    return this._cents === other._cents;
  }
}
