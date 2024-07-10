// External modules
import inquirer from "inquirer";
import chalk from "chalk";

// Internal modules
import fs from "fs";

console.log(chalk.bgYellow.black.bold("Iniciando o Accounts..."));

operation();

function operation() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "O que você deseja fazer?",
        choices: [
          "Criar conta",
          "Consultar saldo",
          "Realizar depósito",
          "Realizar saque",
          "Sair do sistema",
        ],
      },
    ])
    .then((answer) => {
      const action = answer["action"];
      if (action === "Criar conta") {
        createAccount();
      } else if (action === "Consultar saldo") {
        getAccountBalance();
      } else if (action === "Realizar depósito") {
        deposit();
      } else if (action === "Realizar saque") {
        withdraw();
      } else if (action === "Sair do sistema") {
        console.log(chalk.bgBlue.black.bold("Obrigado por usar o Accounts!"));
        process.exit();
      }
    })
    .catch((err) => console.log(err));
}

// Create an account
function createAccount() {
  console.log(chalk.bgGreen.black.bold("Obrigado por escolher o nosso banco!"));
  console.log(chalk.green.bold("Defina as opções da sua conta a seguir."));
  buildAccount();
}

function buildAccount() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite seu nome:",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];
      console.info(accountName);
      if (!fs.existsSync("accounts/")) {
        fs.mkdirSync("accounts/");
      }
      if (findAccount(accountName)) {
        console.log(
          chalk.bgRedBright.black.bold(
            "Esta conta já existe, escolha outro nome!"
          )
        );
        buildAccount();
        return;
      }
      fs.writeFileSync(
        `accounts/${accountName}.json`,
        '{"balance": 0}',
        function (err) {
          console.log(err);
        }
      );
      console.log(
        chalk.bgBlue.white.bold("Parabéns, a sua conta foi criada com sucesso!")
      );
      operation();
    })
    .catch((err) => console.log(err));
}

// Check account balance
function getAccountBalance() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];
      if (!findAccount(accountName)) {
        console.log(
          chalk.bgRedBright.black.bold(
            "Esta conta não existe, escolha outro nome!"
          )
        );
        return getAccountBalance();
      }
      const accountData = getAccount(accountName);
      console.log(
        chalk.bgBlue.white.bold(
          `Seja bem-vindo, ${accountName}! Seu saldo é de R$${accountData.balance}`
        )
      );
      operation();
    })
    .catch((err) => console.log(err));
}

// Add an amount to user account
function deposit() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite o nome da conta para depósito:",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];
      if (!findAccount(accountName)) {
        console.log(
          chalk.bgRedBright.black.bold(
            "Esta conta não existe, escolha outro nome!"
          )
        );
        return deposit();
      }
      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto deseja depositar?",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];
          if (amount < 0) {
            console.log(
              chalk.bgRedBright.black.bold(
                "O valor do depósito deve ser positivo!"
              )
            );
            return deposit();
          }
          updateBalance(accountName, amount);
          operation();
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

// Withdraw an amount from user account
function withdraw() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];
      if (!findAccount(accountName)) {
        console.log(
          chalk.bgRedBright.black.bold(
            "Esta conta não existe, escolha outro nome!"
          )
        );
        return withdraw();
      }
      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto deseja sacar?",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];
          if (amount < 0) {
            console.log(
              chalk.bgRedBright.black.bold(
                "O valor do saque deve ser positivo!"
              )
            );
            return withdraw();
          }
          updateBalance(accountName, -1 * amount);
          operation();
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

function findAccount(accountName) {
  return fs.existsSync(`accounts/${accountName}.json`);
}

function getAccount(accountName) {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: "utf8",
    flag: "r",
  });
  return JSON.parse(accountJSON);
}

function updateBalance(accountName, amount) {
  const accountData = getAccount(accountName);
  if (!amount) {
    console.log(
      chalk.bgRedBright.black.bold("Erro ao obter quantia! Tente novamente.")
    );
    return;
  }
  const newBalance = parseFloat(accountData.balance) + parseFloat(amount);
  if (newBalance < 0) {
    console.log(
      chalk.bgRedBright.black.bold(
        `Saldo insuficiente! Valor disponível para saque: R$${accountData.balance}`
      )
    );
    return;
  }
  accountData.balance = newBalance;
  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err);
    }
  );
  console.log(
    chalk.bgGreen.white.bold(
      `Operação realizada com sucesso! Novo saldo: R$${accountData.balance}`
    )
  );
}
