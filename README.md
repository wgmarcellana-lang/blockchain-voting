# VoteChain Local Testing Guide

## Requirements

- Node.js 18 or newer
- Git
- MetaMask browser extension

## 1. Install Dependencies

From the project folder:

```bash
cd blockchain
npm install

cd ../votechain
npm install
```

## 2. Create Environment Files

From the `votechain` folder:

```bash
cp .env.local.example .env.local
cp .env.local .env
```

Keep the database value as:

```env
DATABASE_URL="file:./dev.db"
```

## 3. Set Up the Database

From the `votechain` folder:

```bash
npm run db:migrate
npm run db:seed
```

Demo students:

```text
Student ID: 202215505
Email: willyn.grace.marcellana@adamson.edu.ph

Student ID: 202213764
Email: constante.dizon.ii@adamson.edu.ph
```

## 4. Start Hardhat

Open a new terminal:

```bash
cd blockchain
npx hardhat node
```

Keep this terminal open.

## 5. Add Hardhat to MetaMask

If this is your first time opening MetaMask:

1. Click `Create a new wallet`.
2. You do not need Google or Apple sign-in.
3. Choose `Use Secret Recovery Phrase` if MetaMask asks how you want to set up the wallet.
4. Finish the setup with any local testing password.

Add this network in MetaMask:

```text
Network name: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency symbol: ETH
```

To add the network:

1. Open MetaMask.
2. Click the network dropdown at the top.
3. Click `Add a custom network` or `Add network manually`.
4. Enter the Hardhat Local values above.
5. Save and select `Hardhat Local`.

Import Hardhat accounts:

1. Go back to the terminal running `npx hardhat node`.
2. Copy the private key for `Account #0`.
3. In MetaMask, open the account menu.
4. Click `Add wallet`.
5. Click `Import an account`.
6. Keep the type as `Private key`.
7. Paste the private key.
8. Click `Import`.
9. Repeat with `Account #1` if you want a separate student wallet.

Use:

- Account #0 as the admin wallet
- Account #1 or another account as the student wallet

If MetaMask shows `10,000 ETH` on `Hardhat Local`, it is connected correctly.

## 6. Deploy the Contract

Open another terminal:

```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network localhost
```

Copy the printed values:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS="0x..."
NEXT_PUBLIC_ADMIN_ADDRESS="0x..."
```

Paste them into:

```text
votechain/.env.local
votechain/.env
```

## 7. Start the Website

Open another terminal:

```bash
cd votechain
npm run dev
```

Open:

```text
http://localhost:3000
```

Admin page:

```text
http://localhost:3000/admin
```

Admin login:

```text
Username: acomss
Password: acomss
```

## 8. Test the Demo

1. Go to `/admin`.
2. Log in as admin.
3. Connect MetaMask using Hardhat Account #0.
4. Add positions.
5. Add candidates.
6. Open voting.
7. Switch MetaMask to a student account.
8. Go to `/register`.
9. Register using one demo student.
10. Switch back to the admin wallet.
11. Approve the pending student in `/admin`.
12. Switch back to the student wallet.
13. Go to `/vote`.
14. Vote and confirm the MetaMask transaction.
15. Switch back to admin.
16. Close voting.
17. Go to `/results`.

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

## Reset Local Data

From the `votechain` folder:

```bash
rm -f prisma/dev.db
npm run db:migrate
npm run db:seed
```

If Hardhat was restarted, deploy the contract again and update the contract values in `.env.local` and `.env`.
