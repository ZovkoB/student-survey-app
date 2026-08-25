import {
  PrismaClient,
  QuestionType,
  Role,
  type Question,
  type QuestionOption,
  type Survey,
  type User,
} from "@prisma/client";
import { compare, hash } from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@fsre.sum.ba";
const PASSWORD_PLAIN = "password123";
const BCRYPT_SALT_ROUNDS = 10;

const studentsSeed = [
  {
    email: "marko.ramic@fsre.sum.ba",
    studyProgram: "Racunarstvo",
    yearOfStudy: 1,
  },
  {
    email: "ana.hodzic@fsre.sum.ba",
    studyProgram: "Racunarstvo",
    yearOfStudy: 3,
  },
  {
    email: "ivan.kovacevic@fsre.sum.ba",
    studyProgram: "Strojarstvo",
    yearOfStudy: 2,
  },
  {
    email: "lejla.selimovic@fsre.sum.ba",
    studyProgram: "Strojarstvo",
    yearOfStudy: 4,
  },
  {
    email: "dino.mujkic@fsre.sum.ba",
    studyProgram: "Elektrotehnika",
    yearOfStudy: 5,
  },
] as const;

type QuestionWithOptions = Question & { options: QuestionOption[] };
type SurveyWithQuestions = Survey & { questions: QuestionWithOptions[] };

async function hashPassword(plainPassword: string): Promise<string> {
  const passwordHash = await hash(plainPassword, BCRYPT_SALT_ROUNDS);
  const passwordMatches = await compare(plainPassword, passwordHash);

  if (!passwordMatches) {
    throw new Error("bcrypt hash verification failed for seeded password.");
  }

  return passwordHash;
}

async function clearDatabase() {
  await prisma.answer.deleteMany();
  await prisma.response.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.survey.deleteMany();
  await prisma.user.deleteMany({
    where: {
      email: {
        not: ADMIN_EMAIL,
      },
    },
  });
}

async function ensureAdmin(passwordHash: string) {
  return prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      passwordHash,
      role: Role.ADMIN,
    },
    create: {
      email: ADMIN_EMAIL,
      passwordHash,
      role: Role.ADMIN,
    },
  });
}

async function ensureStudents(passwordHash: string) {
  const students: User[] = [];

  for (const student of studentsSeed) {
    const createdStudent = await prisma.user.upsert({
      where: { email: student.email },
      update: {
        passwordHash,
        role: Role.STUDENT,
        studyProgram: student.studyProgram,
        yearOfStudy: student.yearOfStudy,
      },
      create: {
        email: student.email,
        passwordHash,
        role: Role.STUDENT,
        studyProgram: student.studyProgram,
        yearOfStudy: student.yearOfStudy,
      },
    });
    students.push(createdStudent);
  }

  return students;
}

async function relinkSurveysToAdmin(adminId: string) {
  const updated = await prisma.survey.updateMany({
    where: {
      createdBy: {
        email: ADMIN_EMAIL,
      },
      NOT: {
        createdById: adminId,
      },
    },
    data: {
      createdById: adminId,
    },
  });

  return updated.count;
}

async function createSurveyWithQuestions(
  adminId: string,
  surveyData: {
    title: string;
    description: string;
    subject?: string;
    targetProgram?: string;
    targetYear?: number;
    isActive?: boolean;
    questions: {
      text: string;
      type: QuestionType;
      isRequired?: boolean;
      order: number;
      options?: string[];
    }[];
  },
): Promise<SurveyWithQuestions> {
  return prisma.survey.create({
    data: {
      title: surveyData.title,
      description: surveyData.description,
      subject: surveyData.subject,
      targetProgram: surveyData.targetProgram,
      targetYear: surveyData.targetYear,
      isActive: surveyData.isActive ?? true,
      createdById: adminId,
      questions: {
        create: surveyData.questions.map((question) => ({
          text: question.text,
          type: question.type,
          isRequired: question.isRequired ?? true,
          order: question.order,
          options:
            question.options && question.options.length > 0
              ? {
                  create: question.options.map((optionText, index) => ({
                    text: optionText,
                    order: index,
                  })),
                }
              : undefined,
        })),
      },
    },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          options: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });
}

function getQuestionByOrder(survey: SurveyWithQuestions, order: number) {
  const question = survey.questions.find((item) => item.order === order);
  if (!question) {
    throw new Error(`Question with order ${order} not found in survey ${survey.title}`);
  }
  return question;
}

function optionId(question: QuestionWithOptions, index: number) {
  const option = question.options[index];
  if (!option) {
    throw new Error(`Option at index ${index} not found for question ${question.text}`);
  }
  return option.id;
}

async function createResponse(
  survey: SurveyWithQuestions,
  student: User,
  answers: {
    questionOrder: number;
    selectedOptionIndexes?: number[];
    textValue?: string;
    ratingValue?: number;
  }[],
  submittedAt: Date,
) {
  if (!student.studyProgram || student.yearOfStudy === null) {
    throw new Error(`Student ${student.email} is missing profile data.`);
  }

  const answerCreates = answers.flatMap((answer) => {
    const question = getQuestionByOrder(survey, answer.questionOrder);

    if (question.type === QuestionType.SINGLE_CHOICE) {
      const selectedIndex = answer.selectedOptionIndexes?.[0];
      if (selectedIndex === undefined) {
        return [];
      }

      return [
        {
          questionId: question.id,
          selectedOptionId: optionId(question, selectedIndex),
        },
      ];
    }

    if (question.type === QuestionType.MULTIPLE_CHOICE) {
      return (answer.selectedOptionIndexes ?? []).map((selectedIndex) => ({
        questionId: question.id,
        selectedOptionId: optionId(question, selectedIndex),
      }));
    }

    if (question.type === QuestionType.TEXT) {
      return answer.textValue
        ? [
            {
              questionId: question.id,
              textValue: answer.textValue,
            },
          ]
        : [];
    }

    if (question.type === QuestionType.RATING_1_5) {
      return answer.ratingValue !== undefined
        ? [
            {
              questionId: question.id,
              ratingValue: answer.ratingValue,
            },
          ]
        : [];
    }

    return [];
  });

  await prisma.response.create({
    data: {
      surveyId: survey.id,
      studentId: student.id,
      studentProgram: student.studyProgram,
      studentYear: student.yearOfStudy,
      submittedAt,
      answers: {
        create: answerCreates,
      },
    },
  });
}

async function seedResponses(
  programmingSurvey: SurveyWithQuestions,
  generalSurvey: SurveyWithQuestions,
  labSurvey: SurveyWithQuestions,
  students: User[],
) {
  const [marko, ana, ivan, lejla, dino] = students;

  await createResponse(
    programmingSurvey,
    ana,
    [
      { questionOrder: 0, selectedOptionIndexes: [1] },
      { questionOrder: 1, selectedOptionIndexes: [0, 2] },
      { questionOrder: 2, ratingValue: 4 },
      {
        questionOrder: 3,
        textValue:
          "Predložila bih više praktičnih primjera iz stvarnih projekata tokom vježbi.",
      },
    ],
    new Date("2026-03-10T10:15:00.000Z"),
  );

  await createResponse(
    programmingSurvey,
    marko,
    [
      { questionOrder: 0, selectedOptionIndexes: [2] },
      { questionOrder: 1, selectedOptionIndexes: [1, 3] },
      { questionOrder: 2, ratingValue: 3 },
      {
        questionOrder: 3,
        textValue:
          "Korisnije bi bilo imati dodatne konsultacije prije ispita i više materijala na platformi.",
      },
    ],
    new Date("2026-03-11T14:40:00.000Z"),
  );

  await createResponse(
    generalSurvey,
    marko,
    [
      { questionOrder: 0, selectedOptionIndexes: [1] },
      { questionOrder: 1, selectedOptionIndexes: [0, 1, 3] },
      { questionOrder: 2, ratingValue: 4 },
      {
        questionOrder: 3,
        textValue:
          "Organizacija studija je dobra, ali bi nam pomogla bolja komunikacija oko rasporeda ispita.",
      },
    ],
    new Date("2026-03-12T09:20:00.000Z"),
  );

  await createResponse(
    generalSurvey,
    ana,
    [
      { questionOrder: 0, selectedOptionIndexes: [0] },
      { questionOrder: 1, selectedOptionIndexes: [0, 2] },
      { questionOrder: 2, ratingValue: 5 },
      {
        questionOrder: 3,
        textValue:
          "Zadovoljna sam kvalitetom nastave i podrškom nastavnog osoblja tokom semestra.",
      },
    ],
    new Date("2026-03-12T11:05:00.000Z"),
  );

  await createResponse(
    generalSurvey,
    ivan,
    [
      { questionOrder: 0, selectedOptionIndexes: [2] },
      { questionOrder: 1, selectedOptionIndexes: [1, 2] },
      { questionOrder: 2, ratingValue: 3 },
      {
        questionOrder: 3,
        textValue:
          "Laboratorijske vježbe su kvalitetne, ali bi trebalo modernizovati dio opreme u radionicama.",
      },
    ],
    new Date("2026-03-13T08:50:00.000Z"),
  );

  await createResponse(
    generalSurvey,
    lejla,
    [
      { questionOrder: 0, selectedOptionIndexes: [1] },
      { questionOrder: 1, selectedOptionIndexes: [2, 3] },
      { questionOrder: 2, ratingValue: 4 },
      {
        questionOrder: 3,
        textValue:
          "Studij pruža dobar balans između teorije i prakse, posebno kroz projektne zadatke.",
      },
    ],
    new Date("2026-03-13T16:25:00.000Z"),
  );

  await createResponse(
    generalSurvey,
    dino,
    [
      { questionOrder: 0, selectedOptionIndexes: [3] },
      { questionOrder: 1, selectedOptionIndexes: [0, 3] },
      { questionOrder: 2, ratingValue: 2 },
      {
        questionOrder: 3,
        textValue:
          "Potrebno je poboljšati dostupnost literature i ubrzati objavljivanje ocjena nakon ispita.",
      },
    ],
    new Date("2026-03-14T13:10:00.000Z"),
  );

  await createResponse(
    labSurvey,
    dino,
    [
      { questionOrder: 0, selectedOptionIndexes: [0] },
      { questionOrder: 1, selectedOptionIndexes: [0, 1, 3] },
      { questionOrder: 2, ratingValue: 5 },
      {
        questionOrder: 3,
        textValue:
          "Laboratorijske vježbe iz Elektrotehnike su odlično organizovane i veoma korisne za praksu.",
      },
    ],
    new Date("2026-03-15T12:00:00.000Z"),
  );
}

async function main() {
  console.log("Brisanje postojećih podataka...");
  await clearDatabase();

  console.log("Kreiranje korisnika...");
  const passwordHash = await hashPassword(PASSWORD_PLAIN);
  console.log(
    `Lozinke hashirane bcrypt algoritmom (hash("${PASSWORD_PLAIN}", ${BCRYPT_SALT_ROUNDS})).`,
  );

  const admin = await ensureAdmin(passwordHash);
  const students = await ensureStudents(passwordHash);
  const relinkedSurveys = await relinkSurveysToAdmin(admin.id);

  console.log(`Admin račun: ${admin.email} (ID: ${admin.id})`);
  if (relinkedSurveys > 0) {
    console.log(`Ponovo povezano anketa sa admin računom: ${relinkedSurveys}`);
  }

  console.log("Kreiranje anketa...");
  const programmingSurvey = await createSurveyWithQuestions(admin.id, {
    title: "Evaluacija nastave – Programiranje",
    description:
      "Anketa za studente smjera Računarstvo o kvaliteti nastave predmeta Programiranje u ljetnom semestru.",
    subject: "Programiranje",
    targetProgram: "Racunarstvo",
    questions: [
      {
        text: "Kako ocjenjujete jasnoću predavanja?",
        type: QuestionType.SINGLE_CHOICE,
        order: 0,
        options: ["Odlično", "Dobro", "Prosječno", "Slabo"],
      },
      {
        text: "Koje nastavne metode vam najviše odgovaraju?",
        type: QuestionType.MULTIPLE_CHOICE,
        order: 1,
        options: [
          "Predavanja",
          "Laboratorijske vježbe",
          "Online materijali",
          "Projektne zadaće",
        ],
      },
      {
        text: "Ocijenite korisnost laboratorijskih vježbi (1-5).",
        type: QuestionType.RATING_1_5,
        order: 2,
      },
      {
        text: "Koje poboljšanje biste predložili za sljedeći semestar?",
        type: QuestionType.TEXT,
        order: 3,
      },
    ],
  });

  const generalSurvey = await createSurveyWithQuestions(admin.id, {
    title: "Opća anketa o kvaliteti studija",
    description:
      "Anketa o općem zadovoljstvu studijem, nastavnom procesu i studentskim uslugama na Fakultetu.",
    subject: "Opće",
    questions: [
      {
        text: "Koliko ste zadovoljni organizacijom studijskog programa?",
        type: QuestionType.SINGLE_CHOICE,
        order: 0,
        options: [
          "Vrlo zadovoljan/na",
          "Zadovoljan/na",
          "Neutralno",
          "Nezadovoljan/na",
        ],
      },
      {
        text: "Koje studentske usluge najviše koristite?",
        type: QuestionType.MULTIPLE_CHOICE,
        order: 1,
        options: [
          "E-learning platforma",
          "Studentska služba",
          "Biblioteka",
          "Online konsultacije",
        ],
      },
      {
        text: "Ocijenite ukupno iskustvo studiranja (1-5).",
        type: QuestionType.RATING_1_5,
        order: 2,
      },
      {
        text: "Navedite komentar ili prijedlog za poboljšanje studija.",
        type: QuestionType.TEXT,
        order: 3,
      },
    ],
  });

  const labSurvey = await createSurveyWithQuestions(admin.id, {
    title: "Anketa o laboratorijskim vježbama – Elektrotehnika",
    description:
      "Anketa o kvaliteti laboratorijskih vježbi, opremi i podršci nastavnika za studente smjera Elektrotehnika.",
    subject: "Laboratorijske vježbe",
    targetProgram: "Elektrotehnika",
    questions: [
      {
        text: "Koliko su vježbe usklađene sa gradivom predmeta?",
        type: QuestionType.SINGLE_CHOICE,
        order: 0,
        options: [
          "Potpuno usklađene",
          "Uglavnom usklađene",
          "Djelimično usklađene",
          "Neusklađene",
        ],
      },
      {
        text: "Koje elemente laboratorija smatrate najkorisnijim?",
        type: QuestionType.MULTIPLE_CHOICE,
        order: 1,
        options: [
          "Praktični rad",
          "Upute prije vježbe",
          "Rad u malim grupama",
          "Demonstracije nastavnika",
        ],
      },
      {
        text: "Ocijenite stanje laboratorijske opreme (1-5).",
        type: QuestionType.RATING_1_5,
        order: 2,
      },
      {
        text: "Opišite iskustvo sa laboratorijskim vježbama u posljednjem semestru.",
        type: QuestionType.TEXT,
        order: 3,
      },
    ],
  });

  console.log("Generisanje odgovora studenata...");
  await seedResponses(programmingSurvey, generalSurvey, labSurvey, students);

  const relinkedAfterCreate = await relinkSurveysToAdmin(admin.id);
  const adminSurveyCount = await prisma.survey.count({
    where: { createdById: admin.id },
  });

  console.log("\nSeed završen uspješno.");
  console.log(`Admin: ${ADMIN_EMAIL} / ${PASSWORD_PLAIN}`);
  console.log(`Admin ID: ${admin.id}`);
  console.log(`Anketa povezanih sa adminom: ${adminSurveyCount}`);
  if (relinkedAfterCreate > 0) {
    console.log(`Dodatno povezano anketa: ${relinkedAfterCreate}`);
  }
  console.log("Studenti:");
  for (const student of studentsSeed) {
    console.log(
      `- ${student.email} (${student.studyProgram}, ${student.yearOfStudy}. godina) / ${PASSWORD_PLAIN}`,
    );
  }
  console.log(`\nAnkete: ${programmingSurvey.title}, ${generalSurvey.title}, ${labSurvey.title}`);
  console.log("Ukupno odgovora: 8");
}

main()
  .catch((error) => {
    console.error("Greška tokom seed procesa:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
