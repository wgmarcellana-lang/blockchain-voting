## Requirements

- Node.js 18 or newer
- Git

## 1. Install Dependencies

```bash
cd blockchain
npm install

cd ../votechain
npm install
```

## 2. Create Environment Files

From the `votechain` folder:

Windows PowerShell:

```powershell
Copy-Item .env.local.example .env.local
Copy-Item .env.local .env
```

macOS/Linux:

```bash
cp .env.local.example .env.local
cp .env.local .env
```

Keep the database value as:

```env
DATABASE_URL="file:./dev.db"
```

## 3. Start Hardhat

Open a new terminal:

```bash
cd blockchain
npx.cmd hardhat node
```

Keep this terminal open.

## 4. Deploy the Contract

Open another terminal:

```bash
cd blockchain
npx.cmd hardhat run scripts/deploy.ts --network localhost
```

On macOS/Linux, you can use:

```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network localhost
```

Copy the deployed contract address and put it into:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS="0x..."
```

## 5. Configure the Server Signer

Use one of the private keys printed by `npx hardhat node`, usually `Account #0`.

Set this in both `votechain/.env.local` and `votechain/.env`:

```env
SERVER_WALLET_PRIVATE_KEY="0x..."
```

Also set strong cookie secrets:

```env
ADMIN_SESSION_SECRET="replace_with_a_long_random_string"
VOTER_SESSION_SECRET="replace_with_another_long_random_string"
```

## 6. Set Up the Database

From the `votechain` folder:

Windows PowerShell:

```powershell
npm.cmd run db:migrate
npm.cmd run db:seed
```

macOS/Linux:

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

## 7. Start the Website

Windows PowerShell:

```powershell
cd votechain
npm.cmd run dev
```

macOS/Linux:

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

1. Go to `/admin` and log in.
2. Add positions.
3. Add candidates.
4. Open voting.
5. Go to `/register`.
6. Register using one demo student.
7. Return to `/admin`.
8. Approve the pending registration.
9. Go to `/vote`.
10. Sign in using the same student ID and email.
11. Cast a vote.
12. Return to `/admin`.
13. Close voting.
14. Visit `/results`.

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

Windows PowerShell:

```powershell
Remove-Item -LiteralPath .\prisma\dev.db -ErrorAction SilentlyContinue
npm.cmd run db:migrate
npm.cmd run db:seed
```

macOS/Linux:

```bash
rm -f prisma/dev.db
npm run db:migrate
npm run db:seed
```

If Hardhat was restarted, deploy the contract again and update `NEXT_PUBLIC_CONTRACT_ADDRESS`.
