import { HttpAgent, Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
// import { idlFactory as icpFactory } from './declarations/nns-ledger';
import { idlFactory as backendFactory } from './declarations/backend';
// import { _SERVICE as bobService } from './declarations/nns-ledger';
import { _SERVICE as reBobService } from './declarations/service_hack/service';
// import { _SERVICE as reBobService } from './declarations/backend/';
import { Token } from './declarations/internet_identity/internet_identity.did';

interface TokenObjectParams {
  actor: reBobService | null;
  fee: bigint;
  ticker: string;
  decimals: number;
  ledgerBalance: bigint;
  canisterId: string;
  setToken: ((value: TokenObject) => void) | null;
  loggedInPrincipal: string;
}

class TokenObject {
  public actor: reBobService | null;
  public fee: bigint;
  public ticker: string;
  public decimals: number;
  public ledgerBalance: bigint;
  public canisterId: string;
  private setToken: ((value: TokenObject) => void) | null;
  public loggedInPrincipal: string;

  constructor({
    actor,
    fee,
    ticker,
    decimals,
    ledgerBalance,
    canisterId,
    setToken,
    loggedInPrincipal,
  }: TokenObjectParams) {
    this.actor = actor;
    this.fee = fee;
    this.ticker = ticker;
    this.decimals = decimals;
    this.ledgerBalance = ledgerBalance;
    this.canisterId = canisterId;
    this.setToken = setToken;
    this.loggedInPrincipal = loggedInPrincipal;
  }

  // Method to transfer tokens
  async transfer(amountInE8s: bigint, to: string): Promise<boolean> {
    if (!this.actor) return false;
    try {
      // Call the token actor's icrc1_transfer function
      const result = await this.actor.icrc1_transfer({
        amount: amountInE8s, // The amount to transfer (must be a bigint)
        to: {
          owner: Principal.fromText(to), // The recipient's principal
          subaccount: [], // Optional, an empty array for no subaccount
        },
        fee: [this.fee], // Optional fee, default is empty
        memo: [], // Optional memo, default is empty
        from_subaccount: [], // Optional, if you want to specify a subaccount
        created_at_time: [BigInt(Date.now()) * 1000000n],
      });

      console.log({ result });
      // Handle the result
      if ('Ok' in result) {
        console.log(`Transfer successful! Transaction ID: ${result.Ok}`);
        return true; // result.Ok;
      } else if ('Err' in result) {
        console.error('Transfer failed:', result.Err);
        return false; // result.Err;
      }
    } catch (error) {
      console.error('Error during token transfer:', error);
      throw error;
    } finally {
      this.getLedgerBalance(); // I'm not sure if this is the best way to do this.
    }
    return true; // Replace with actual implementation
  }

  async approve(amountInE8s: bigint, to: string): Promise<boolean> {
    if (!this.actor) return false;
    try {
      const approvalResult = await this.actor.icrc2_approve({
        amount: amountInE8s, // Approve amount and the fee to send bob back during icrc2_transfer_from() in deposit() function
        // Adjust with your canister ID and parameters
        spender: {
          owner: Principal.fromText(to),
          subaccount: [],
        },
        memo: [],
        fee: [this.fee],
        created_at_time: [BigInt(Date.now()) * 1000000n],
        expires_at: [
          BigInt(Date.now()) * 1000000n + 60n * 60n * 1000n * 1000000n,
        ], //1 hour approval
        expected_allowance: [],
        from_subaccount: [],
      });

      console.log(approvalResult);

      if ('Ok' in approvalResult) {
        return true;
      } else {
        console.error(
          `Failed to approve ${this.ticker}`,
          approvalResult.Err.toString()
        );
        return false;
      }
    } catch (error) {
      console.error(`Error occurred when approving ${this.ticker}:`, error);
      return false;
    }
  }

  async deposit(amountInE8s: bigint): Promise<boolean> {
    if (!this.actor) return false;
    try {
      const result = await this.actor.deposit([], amountInE8s);

      if ('ok' in result) {
        return true;
      } else {
        console.error(
          `Failed to deposit ${this.ticker}`,
          result.err.toString()
        );
        return false;
      }
    } catch (error) {
      console.error(`Error occurred when depositing ${this.ticker}:`, error);
      return false;
    }
  }

  async withdraw(amountInE8s: bigint): Promise<boolean> {
    if (!this.actor) return false;

    console.log({ amountInE8s });

    try {
      const result = await this.actor.withdraw([], amountInE8s);

      if ('ok' in result) {
        return true;
      } else {
        console.log({ result });
        console.error(`Failed to burn ${this.ticker}:`, result.err.toString());
        return false;
      }
    } catch (error) {
      console.error(`Burning ${this.ticker} failed:`, error);
      return false;
    }
  }

  // Method to get the ledger balance
  async getLedgerBalance(): Promise<bigint | null> {
    if (this.actor === null) return null;

    try {
      console.log(
        'attempting to fecth a balance from ',
        this.canisterId,
        ' of ',
        this.loggedInPrincipal
      );
      const response = await this.actor.icrc1_balance_of({
        owner: Principal.fromText(this.loggedInPrincipal),
        subaccount: [],
      });

      console.log('Fetching balances...', { response });
      this.ledgerBalance = response;

      this.refresh();

      return response;
    } catch (e) {
      console.error(
        `Something went wrong fectching a balance. ${this.ticker}`,
        e
      );
    } finally {
      return null;
    }
  }

  async setGameCompleted(): Promise<void> {
    if (this.actor === null) return;
    try {
      const isCompleted = await this.checkGameCompleted();
      if (!isCompleted) {
        console.log('setting game completed');
        this.actor.setGameCompleted();
      }
    } catch (error) {
      console.log(
        "an error occurred while trying to let the backend know you've completed the game.",
        error
      );
    }
  }

  async checkGameCompleted(): Promise<boolean> {
    if (this.actor === null) return false;
    try {
      const isCompleted = await this.actor.didPrincipalWin(
        Principal.fromText(this.loggedInPrincipal)
      );
      // console.log(
      //   'Checked if the game was completed, backend says:',
      //   isCompleted
      // );
      return isCompleted;
    } catch (error) {
      console.log(
        "an error occurred while trying to ask the backend if you've completed the game.",
        error
      );
    }

    return false;
  }

  printDetails(): void {
    console.log('actor', this.actor);
    console.log('fee', this.fee);
    console.log('ticker', this.ticker);
    console.log('decimals', this.decimals);
    console.log('ledgerBalance', this.ledgerBalance);
    console.log('canisterId', this.canisterId);
    console.log('loggedInPrincipal', this.loggedInPrincipal);
  }

  async logout(): Promise<void> {
    this.actor = null;
    this.ledgerBalance = 0n;
    this.loggedInPrincipal = '';
    this.refresh();
  }

  // Method to set up the actor
  async setActor(
    method: 'plug' | 'ii',
    agent: HttpAgent | null
  ): Promise<void> {
    if (method === 'plug') {
      this.actor = await window.ic.plug.createActor({
        canisterId: this.canisterId,
        interfaceFactory: backendFactory, // This should work for the primary token as well as the backend hopefully.
      });
    } else if (method === 'ii' && agent) {
      this.actor = await Actor.createActor(backendFactory, {
        // This should work for the primary token as well as the backend hopefully.
        agent,
        canisterId: this.canisterId,
      });
    }
    this.getLedgerBalance();
    //this.refresh();
  }

  async setLoggedInPrincipal(principal: string): Promise<void> {
    this.loggedInPrincipal = principal;
  }

  async refresh(): Promise<void> {
    if (!this.setToken) return;
    this.setToken(
      new TokenObject({
        actor: this.actor,
        ledgerBalance: this.ledgerBalance,
        fee: this.fee,
        ticker: this.ticker,
        decimals: this.decimals,
        canisterId: this.canisterId,
        setToken: this.setToken,
        loggedInPrincipal: this.loggedInPrincipal,
      })
    );
  }
}

export default TokenObject;
