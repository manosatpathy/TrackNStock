import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
const prisma = new PrismaClient();

async function deleteAllData(orderedFileNames: string[]) {
  const modelNames = orderedFileNames.map((fileName) => {
    const modelName = path.basename(fileName, path.extname(fileName));
    return modelName.charAt(0).toUpperCase() + modelName.slice(1);
  });

  for (const modelname of modelNames) {
    const model: any = prisma[modelname as keyof typeof prisma];
    if (model) {
      await model.deleteMany({});
      console.log(`cleared data from ${model}`);
    } else {
      console.error(
        `Model ${modelname} not found. Please ensure the model name is correctly specified.`
      );
    }
  }
}

async function main() {
  const dataDirectory = path.join(__dirname, "seedData");
  const orderedFileNames = [
    "products.json",
    "expenseSummary.json",
    "sales.json",
    "salesSummary.json",
    "purchases.json",
    "purchaseSummary.json",
    "users.json",
    "expenses.json",
    "expenseByCategory.json",
  ];

  await deleteAllData(orderedFileNames);

  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);
    const jsonData = fs.readFileSync(filePath, "utf-8");
    const modelName = path.basename(fileName, path.extname(fileName));
    const model: any = prisma[modelName as keyof typeof prisma];

    if (!model) {
      console.error(`No Prisma model matches the file name: ${fileName}`);
      continue;
    }

    for (const data of jsonData) {
      model.create({
        data,
      });
    }
    console.log(`Seeded ${modelName} with data from ${fileName}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect;
  });
