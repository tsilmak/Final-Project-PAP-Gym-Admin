import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.paymentStatus.createMany({
    data: [
      { paymentStatusName: "Pendente" },
      { paymentStatusName: "Pago" },
      { paymentStatusName: "Cancelado" },
      { paymentStatusName: "Reembolsado" },
    ],
    skipDuplicates: true,
  });
  await prisma.roles.createMany({
    data: [
      { rolesName: "Cliente" },
      { rolesName: "Administrador" },
      { rolesName: "Nutricionista" },
      { rolesName: "Treinador" },
    ],
    skipDuplicates: true,
  });
  await prisma.gymPlan.createMany({
    data: [
      {
        name: "Plano Gratuito",
        price: 0,
        features: [{ feature: "Exclusivo para funcionários" }],
        isActive: false,
        isHighlightedPlan: false,
      },
      {
        name: "Plano Simples",
        price: 25,
        features: [
          { feature: "Supervisão / acompanhamento de treino" },
          {
            feature: "Avaliação e prescrição de treino individualizado",
          },
        ],
        isActive: true,
        isHighlightedPlan: false,
        productStripeId: "prod_RGqAgZXx2u5Jpj",
        priceStripeId: "price_1QOiKcCRniDWvC9XnknJjORY",
      },
      {
        name: "Plano Livre Acesso",
        price: 30,
        features: [
          { feature: "Livre Trânsito" },
          {
            feature: "Supervisão / acompanhamento de treino",
          },
          {
            feature: "Avaliação e prescrição de treino individualizado",
          },
        ],
        isActive: true,
        isHighlightedPlan: false,
        productStripeId: "prod_RGqAMEjKR",
        priceStripeId: "price_1QOIaoCRniDWvC9XjJgrVflG",
      },
      {
        name: "Plano Completo",
        price: 44,
        features: [
          { feature: "Livre Trânsito" },
          {
            feature: "Supervisão / acompanhamento de treino",
          },
          {
            feature: "Avaliação e prescrição de treino individualizado",
          },
          {
            feature: "Aulas de grupo",
          },
          {
            feature: "Reserva de aulas com 23 horas de antecedência",
          },
          {
            feature: "Aulas Bike ICG Lifefitness",
          },
          {
            feature: "Aconselhamento nutricional",
          },
        ],
        isActive: true,
        isHighlightedPlan: true,
        productStripeId: "prod_RGqCBLpwM",
        priceStripeId: "price_1QOIcACRniDWvC9Xq0tjJPoa",
      },
      {
        name: "Plano Premium",
        price: 64,
        features: [
          { feature: "Livre Trânsito" },
          {
            feature: "Supervisão / acompanhamento de treino",
          },
          {
            feature: "Avaliação e prescrição de treino individualizado",
          },
          {
            feature: "Aulas de grupo",
          },
          {
            feature: "Reserva de aulas com 23 horas de antecedência",
          },
          {
            feature: "Aulas Bike ICG Lifefitness",
          },
          {
            feature: "Aconselhamento nutricional",
          },
          {
            feature: "Aulas exclusivas",
          },
          {
            feature: "BOX (Crosstraining)",
          },
        ],
        isActive: true,
        isHighlightedPlan: false,
        productStripeId: "prod_RGqDP0a6f",
        priceStripeId: "price_1QOIXOCRniDWvC9XCrHtP009",
      },
    ],
    skipDuplicates: true,
  });
  await prisma.user.createMany({
    data: [
      // ADMIN
      {
        membershipNumber: "249758",
        email: "admin@gymhub.com",
        hashedPassword: "wxkm4Dm1bJ7hufmLKE4qnhSsU/ZROeCjBFFPFJM6me4=",
        salt: "LTw+8t3VgUZ/Gje2gF1Gl40OFpQjRa+z9ugoUFDTNuIx8F0B8gDT42zl5Xclzu5pwzJGmloR3HRMNZvyJhrltc/kfwH6JfbsVHvgNvIT+i7UBlET7A0mgANlnyvjYHLSVPtXrksp1w5edGmT3Ct1cDE/gE5QEx8aR8yK8xt/zMM=",
        fname: "Admin",
        lname: "Admin",
        phoneNumber: "351918654098",
        gender: "Masculino",
        birthDate: "1980-01-09T16:02:56Z",
        docType: "bi",
        docNumber: "123123123",
        nif: "PT123123123",
        address: "Rua das Palmeiras",
        zipcode: "1000-100",
        country: "pt",
        city: "Lisboa",
        roleId: 2,
        customerStripeId: "1",
        profilePictureUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZnDs2em-GXIrJHXDx0UUbQ1LRl0HpH9odQg&s",
      },
      // Treinador
      {
        membershipNumber: "240986",
        email: "treinador@gymhub.com",
        hashedPassword: "x84xy+YQLqyNmIH2Rnq5QGXEZxU9Kc34jbxrIXQBZvE=",
        salt: "HOXrcqK+T87URw0hqmmqYFzFK/tEIAgF68IOIGceMjfKo+7uakpJAQsHSXxilSY7T3HTGRiMDUvDBB/dHsPRT+45sWsoenabudAK6aXOSqLaOkv4U6RiNiyHPxmo/Wwg5sXY60F5sgPLCJxs0my/GvIQFkJ1saJdk1wRfEkbhT4=",
        fname: "Treinador",
        lname: "Treinador",
        phoneNumber: "351910927424",
        gender: "Masculino",
        birthDate: "1990-01-09T16:02:56Z",
        docType: "bi",
        docNumber: "12233123123",
        nif: "PT1224243123123",
        address: "Rua das Palmeiras2",
        zipcode: "1000-100",
        country: "pt",
        city: "Lisboa",
        roleId: 4,
        customerStripeId: "2",
        profilePictureUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZnDs2em-GXIrJHXDx0UUbQ1LRl0HpH9odQg&s",
      },
      {
        membershipNumber: "242586",
        email: "cliente@exemplo.com",
        hashedPassword: "123",
        salt: "123321321123",
        fname: "Cliente",
        lname: "Cliente",
        phoneNumber: "351920427720",
        gender: "Masculino",
        birthDate: "1999-01-09T00:00:00Z",
        docType: "bi",
        docNumber: "12233123123",
        nif: "PT124424243123123",
        address: "Rua dos Gatos",
        zipcode: "1000-100",
        country: "pt",
        city: "Lisboa",
        roleId: 1,
        customerStripeId: "21123123",
        profilePictureUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZnDs2em-GXIrJHXDx0UUbQ1LRl0HpH9odQg&s",
      },
    ],
  });
  await prisma.signature.createMany({
    data: [
      {
        signatureId: 1,
        gymPlanId: 3,
        startDate: "2025-01-01T21:08:59.96Z",
        endDate: null,
        isActive: true,
        userId: 3,
      },
    ],
  });
  await prisma.payment.createMany({
    data: [
      {
        paymentId: 1,
        title: "Registo para o plano Plano Livre Acesso",
        date: "2025-01-01T21:08:59.96Z",
        amount: 29,
        signatureId: 1,
        paymentStatusId: 2,
      },
    ],
  });
}
await prisma.classType.createMany({
  data: [
    { name: "Yoga", color: "#FFD700" },
    { name: "Kickboxing", color: "#FF6347" },
    { name: "CrossFit", color: "#4682B4" },
    { name: "Spinning", color: "#32CD32" },
  ],
  skipDuplicates: true,
});
const MaquinaRemo = await prisma.machine.create({
  data: {
    name: "Remo de Água Acqua Rower",
    type: "Cardio",
    imageUrl:
      "https://res.cloudinary.com/dmfbmt6mi/image/upload/v1734730370/hwwjdrcbkk98ztu0mr7l.jpg",
    imagePublicId: "hwwjdrcbkk98ztu0mr7l",
    description: `O Remo Acqua Rower da Titanium Strength é o produto de cardio perfeito para realizar o famoso “remo”, um dos melhores exercícios cardiovasculares para desportistas de todos os níveis.
Para se ter uma ideia, o golpe de remo usa 84% de massa muscular, fazendo assim um trabalho completo da maioria dos grupos musculares do corpo.
Um aparelho prático e robusto e útil com a máxima qualidade garantida por Titanium Strength.`,
  },
});
await prisma.exercise.createMany({
  data: [
    {
      name: "Remo Cardio Intermediário",
      exerciseType: "Cardio",
      experienceLevel: "Intermediario",
      targetMuscle: "Costas",
      secondaryMuscle: "Braços, Ombros, Abdômen, Pernas",
      commentsAndTips: [
        "Curvar a coluna durante a puxada, especialmente na fase final, pode causar tensão nas costas.",
        "Fazer a puxada com os braços antes de usar as pernas resulta em uma remada ineficaz e pode causar lesões nos ombros.",
        "Movimentos rápidos e descontrolados: A velocidade deve ser constante e controlada, focando na técnica e não na rapidez.",
        "Procurar demasiado resistência logo no início. Começar com uma resistência muito alta pode prejudicar a técnica, especialmente para iniciantes.",
        "O remo de água é um exercício de baixo impacto, mas exige uma boa coordenação entre pernas, tronco e braços para ser eficaz.",
      ],
      execution: [
        "Sente-se no banco e coloca os pés nos pedais, ajustando as tiras para que fiquem confortáveis, mantendo os joelhos ligeiramente dobrados.",
        "Segura o remo com as duas mãos, mantendo os braços esticados à frente do corpo.",
        "Inclina o tronco ligeiramente para frente, mantendo a postura ereta e as costas alinhadas.",
        "Empurra com as pernas, usando os quadríceps e glúteos para impulsionar o corpo para trás.",
        "Ao empurrar, puxa o remo em direção ao teu peito, dobrando os cotovelos e mantendo as costas esticadas.",
        "Mantenha o tronco reto e os ombros relaxados durante a fase de puxada.",
        "Chega o remo até ao peito com os cotovelos apontados para trás e os ombros ligeiramente retraídos.",
        "Reverte o movimento, esticando os braços e permitindo que o tronco se incline ligeiramente para a frente.",
        "Desce as pernas, voltando à posição inicial com os joelhos ligeiramente dobrados.",
        "Repete o movimento de forma contínua, coordenando o movimento das pernas, tronco e braços de forma fluida e controlada.",
      ],
      videoUrl: "https://www.youtube.com/watch?v=0fQjXZY_FtY&themeRefresh=1",
      imageUrl:
        "https://res.cloudinary.com/dmfbmt6mi/image/upload/v1735009961/v0fgwt5vkzfhiz99jh6c.png",
      imagePublicId: "v0fgwt5vkzfhiz99jh6c",
      equipmentId: MaquinaRemo.MachineId,
    },
  ],
});

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
