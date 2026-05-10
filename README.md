# VoteChain Setup Guide

VoteChain is a local blockchain voting app for the ACOMSS election system.

The project is intentionally set up for small demos, presentations, and prototypes. It uses a local Hardhat blockchain for smart-contract behavior and a local SQLite database for student registration data.

The project has two folders:

```text
blockchain/   Smart contract and Hardhat local blockchain
votechain/    Next.js web app, API routes, Prisma, and SQLite database
```

Follow the steps below in order.

## 1. Install Required Apps

Install these first:

- Node.js 18 or newer
- Git
- MetaMask browser extension
- A code editor, preferably VS Code

Check Node, npm, and Git:

```bash
node -v
npm -v
git --version
```

If `node -v` is lower than 18, install a newer Node.js version before continuing.

## 2. Open the Project

Open a terminal in the project folder.

```bash
cd blockchain-voting
```

You should see these folders:

```bash
ls
```

Expected:

```text
blockchain
votechain
README.md
```

## 3. Install Project Dependencies

Install dependencies for the blockchain folder:

```bash
cd blockchain
npm install
```

Install dependencies for the web app folder:

```bash
cd ../votechain
npm install
npm run db:generate
```

This generates the Prisma client used by the admin API routes.

If you are on Windows PowerShell and `npm` is blocked by execution policy, use:

```bash
npm.cmd install
npm.cmd run db:generate
```

## 4. Create Environment Files

From the `votechain` folder:

```bash
cp .env.local.example .env.local
cp .env.local .env
```

Open both files:

```text
votechain/.env.local
votechain/.env
```

For local SQLite, keep:

```env
DATABASE_URL="file:./dev.db"
```

Set the admin values:

```env
ADMIN_USERNAME="acomss"
ADMIN_PASSWORD="acomss"
ADMIN_SESSION_SECRET="replace_with_a_long_random_string"
```

Leave these contract values as `0x` for now:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS="0x"
NEXT_PUBLIC_ADMIN_ADDRESS="0x"
```

Keep these local blockchain values:

```env
NEXT_PUBLIC_CHAIN_ID="31337"
NEXT_PUBLIC_RPC_URL="http://127.0.0.1:8545"
LOCAL_FAUCET_AMOUNT_ETH="10"
```

Important:

- Never commit `.env` or `.env.local`.
- If you edit `.env.local` while the app is running, restart the app.

## 5. Set Up the Local SQLite Database

From the `votechain` folder:

```bash
npm run db:migrate
npm run db:seed
```

The database file is created at:

```text
votechain/prisma/dev.db
```

The seed command adds demo students:

```text
202215505  willyn.grace.marcellana@adamson.edu.ph
202213764  constante.dizon.ii@adamson.edu.ph
```

To reset demo data later:

```bash
rm -f prisma/dev.db
npm run db:migrate
npm run db:seed
```

## 6. Start the Local Blockchain

Open a new terminal.

From the project root:

```bash
cd blockchain
npx hardhat node
```

Keep this terminal open.

Hardhat will show test accounts and private keys.

## 7. Add Hardhat Network to MetaMask

Open MetaMask and add this network:

```text
Network name: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency symbol: ETH
```

Then import Hardhat Account #0 into MetaMask using the private key shown in the Hardhat terminal.

Use Account #0 as the admin wallet.

For student testing, import or use a different account, such as Hardhat Account #1.

## 8. Deploy the Smart Contract

Open another terminal.

From the project root:

```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network localhost
```

The terminal will print something like:

```text
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_ADMIN_ADDRESS=0x...
```

Copy those two values into both files:

```text
votechain/.env.local
votechain/.env
```

## 9. Start the Web App

Open another terminal.

From the project root:

```bash
cd votechain
npm run dev
```

Open the app:

```text
http://localhost:3000
```

## 10. Try the Full Demo

### Admin Setup

1. Go to `http://localhost:3000/admin`.
2. Log in using the admin username and password from `.env.local`.
3. Connect MetaMask with Hardhat Account #0.
4. Add positions.
5. Add candidates.
6. Open voting.

Suggested positions:

```text
AUSG Representative
President
VP Internal
VP External
Secretary
Treasurer
Auditor
P.R.O
```

### Student Registration

1. Switch MetaMask to a student wallet, such as Hardhat Account #1.
2. Go to `http://localhost:3000/register`.
3. Register with one demo student:

```text
Student ID: 202215505
Email: willyn.grace.marcellana@adamson.edu.ph
```

or:

```text
Student ID: 202213764
Email: constante.dizon.ii@adamson.edu.ph
```

### Admin Approval

1. Switch MetaMask back to Hardhat Account #0.
2. Go to `http://localhost:3000/admin`.
3. Approve the pending student registration.

### Student Voting

1. Switch MetaMask back to the approved student wallet.
2. Go to `http://localhost:3000/vote`.
3. Select candidates.
4. Submit the vote.
5. Confirm the transaction in MetaMask.

### Results

1. Switch MetaMask back to the admin wallet.
2. Go to `http://localhost:3000/admin`.
3. Close voting.
4. Go to `http://localhost:3000/results`.

## Common Commands

Blockchain commands:

```bash
cd blockchain
npx hardhat node
npx hardhat run scripts/deploy.ts --network localhost
npm test
```

Web app commands:

```bash
cd votechain
npm run dev
npm run build
npm run db:migrate
npm run db:seed
```

## Common Problems

### The App Cannot Connect to the Contract

Make sure:

1. `npx hardhat node` is running.
2. You deployed the contract.
3. You copied the new contract address into `.env.local` and `.env`.
4. You restarted `npm run dev`.

### MetaMask Is on the Wrong Network

Switch MetaMask to:

```text
Hardhat Local
Chain ID 31337
```

### I Restarted Hardhat

Hardhat resets everything when restarted.

You must:

1. Deploy the contract again.
2. Copy the new contract address into `.env.local` and `.env`.
3. Restart the web app.
4. Add positions and candidates again.
5. Approve students again.

### Prisma Cannot Open the SQLite Database

Check:

1. `DATABASE_URL` is set to `file:./dev.db`.
2. You ran `npm run db:migrate` from the `votechain` folder.
3. The local database exists at `votechain/prisma/dev.db`.
4. You restarted the web app after changing env files.

### The Student Cannot Vote

Check:

1. The student registered with the same MetaMask wallet they are using now.
2. The admin approved the student.
3. Voting is open.
4. The student has not already voted.

## Do Not Commit These Files

Never commit:

```text
votechain/.env
votechain/.env.local
votechain/prisma/dev.db
blockchain/node_modules/
votechain/node_modules/
votechain/.next/
```

---

VoteChain - Adamson Computer Science Society
