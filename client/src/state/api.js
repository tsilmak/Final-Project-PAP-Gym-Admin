import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredetials, logOut } from "./authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  console.log("result", result?.error?.status);
  if (result?.error?.status === 403) {
    console.log("sending refresh token");
    // send refresh token to get new access token
    const refreshResult = await baseQuery("/auth/refresh", api, extraOptions);
    if (refreshResult?.data) {
      // store the new token
      api.dispatch(
        setCredetials({
          accessToken: refreshResult.data.accessToken,
          user: refreshResult.data.user,
        })
      );
      // retry the original query with new access token
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logOut());
    }
  }
  return result;
};
export const api = createApi({
  baseQuery: baseQueryWithReauth,

  reducerPath: "adminApi",
  tagTypes: [
    "users",
    "gymPlans",
    "roles",
    "signatures",
    "payments",
    "chat",
    "Category",
    "Blog",
    "ClassType",
    "Machines",
    "exercises",
    "WorkoutPlans",
    "messages",
  ],
  endpoints: (build) => ({
    refresh: build.mutation({
      query: () => ({
        url: "/auth/refresh",
        method: "GET",
      }),
    }),
    // AUTH
    login: build.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    logout: build.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logOut());
          dispatch(api.util.resetApiState());
        } catch (err) {
          console.log(err);
        }
      },
    }),
    //BLOG
    createBlog: build.mutation({
      query: ({
        title,
        body,
        categories,
        coverImageUrl,
        coverImagePublicId,
        authors,
        published,
      }) => ({
        url: "/blog/add",
        method: "POST",
        body: {
          title,
          body,
          categories,
          coverImageUrl,
          coverImagePublicId,
          published,
          authors,
        },
      }),
      invalidatesTags: ["Blog"],
    }),
    getBlogById: build.query({
      query: (id) => `/blog/${id}`,
    }),
    //GET all blog preview
    getBlogsPreviewByCurrentUserId: build.query({
      query: () => ({
        url: "/blog/preview",
        method: "GET",
      }),
      providesTags: ["Blog"],
    }),
    deleteBlogById: build.mutation({
      query: (blogId) => ({
        url: `blog/${blogId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Blog", "Category"],
    }),
    // USER

    // Available roles for users
    getRoles: build.query({
      query: () => "/users/roles",
      method: "GET",

      providesTags: ["roles"],
    }),
    createUser: build.mutation({
      query: (user) => ({
        url: "/users",
        method: "POST",
        body: user,
      }),
      invalidatesTags: ["users", "signatures", "payments"],
    }),
    getUsers: build.query({
      query: () => "/users",
      method: "GET",

      providesTags: ["users"],
    }),
    getAllEmployees: build.query({
      query: () => "/users/employees",
      method: "GET",

      providesTags: ["employees"],
    }),
    getUsersForTreinador: build.query({
      query: () => "/treinador/clientes",
      method: "GET",

      providesTags: ["users"],
    }),
    getUserByIdForTreinador: build.query({
      query: (userId) => `/treinador/clientes/${userId}`,
      method: "GET",

      providesTags: ["users"],
    }),
    // TODO FAZER TODOS ASSIM
    updateMetricsByUserId: build.mutation({
      query: (data) => ({
        url: `/treinador/clientes/metricas/${data.userId}`,
        method: "POST",
        body: data.metrics,
      }),
      invalidatesTags: ["users"],
    }),
    getUserWorkoutPlan: build.query({
      query: (userId) => ({
        url: `/workoutPlan/user/${userId}`,
        method: "GET",
        providesTags: ["WorkoutPlans"],
      }),
    }),
    createUserWorkoutPlan: build.mutation({
      query: (data) => ({
        url: `/workoutPlan/user/create`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["WorkoutPlans"],
    }),
    editUserWorkoutPlan: build.mutation({
      query: (data) => ({
        url: `/workoutPlan/user/edit`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["WorkoutPlans"],
    }),
    deleteUserWorkoutPlan: build.mutation({
      query: (workoutPlanId) => ({
        url: `/workoutPlan/user/delete/${workoutPlanId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["WorkoutPlans"],
    }),
    getMetricsByUserId: build.query({
      query: (userId) => ({
        url: `/treinador/clientes/metricas/${userId}`,
        method: "GET",
        providesTags: ["users"],
      }),
    }),
    getUser: build.query({
      query: (userId) => `/users/${userId}`,
      providesTags: ["users"],
    }),
    getLast7DaysUsers: build.query({
      query: () => "/users/last7days",
      providesTags: ["users"],
    }),

    updateUser: build.mutation({
      query: ({ userId, user }) => ({
        url: `/users/${userId}`,
        method: "PUT",
        body: user,
      }),
      invalidatesTags: ["users", "gymPlans"],
    }),
    deleteUser: build.mutation({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["users", "signatures", "payments"],
    }),

    // Gym Plans
    createGymPlan: build.mutation({
      query: (plano) => ({
        url: "/gymPlans",
        method: "POST",
        body: plano,
      }),
      invalidatesTags: ["gymPlans"],
    }),
    getGymPlan: build.query({
      query: () => "/gymPlans",
      providesTags: ["gymPlans"],
    }),
    getGymPlanById: build.query({
      query: (gymPlanId) => `/gymPlans/${gymPlanId}`,
      providesTags: (result, error, gymPlanId) => [
        { type: "gymPlans", id: gymPlanId },
      ],
    }),

    updateGymPlan: build.mutation({
      query: ({ gymPlanId, gymPlan }) => ({
        url: `/gymPlans/${gymPlanId}`,
        method: "PUT",
        body: gymPlan,
      }),
      invalidatesTags: ["gymPlans"],
    }),

    deleteGymPlan: build.mutation({
      query: (gymPlanId) => ({
        url: `/gymPlans/${gymPlanId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["gymPlans"],
    }),

    getAllUserFromGymPlanId: build.query({
      query: (gymPlanId) => `/gymPlans/users/${gymPlanId}`,
      providesTags: ["gymPlans"],
    }),
    // Payments

    // Gets all payments status
    getStatus: build.query({
      query: () => "/payments/status",
      providesTags: ["payments"],
    }),
    createPayment: build.mutation({
      query: (payments) => ({
        url: "/payments",
        method: "POST",
        body: payments,
      }),
      invalidatesTags: ["payments"],
    }),
    getAllPayments: build.query({
      query: () => "/payments",
      providesTags: ["payments"],
    }),
    getPaymentById: build.query({
      query: (paymentId) => `/payments/${paymentId}`,
      providesTags: ["payments"],
    }),
    updatePayment: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/payments/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["payments", "signatures"],
    }),
    getPaymentsBySignatureId: build.query({
      query: (signatureId) => `payments/signatures/${signatureId}`,
      providesTags: (result, error, signatureId) => [
        { type: "payments", id: signatureId },
      ],
    }),
    deletePayment: build.mutation({
      query: (paymentId) => ({
        url: `/payments/${paymentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["payments"],
    }),

    // Signatures
    getSignature: build.query({
      query: () => "/signatures",
      providesTags: ["signatures"],
    }),
    getSignatureById: build.query({
      query: (signatureId) => `/signatures/${signatureId}`,
      providesTags: ["signatures"],
    }),
    updateSignature: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/signatures/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["signatures", "gymPlans", "users"],
    }),

    // Category
    createCategory: build.mutation({
      query: (categoryName) => ({
        url: "/category/add",
        method: "POST",
        body: { categoryName },
      }),
      invalidatesTags: ["Category"],
    }),
    createClassType: build.mutation({
      query: (body) => ({
        url: "/class/class-type/add",
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["ClassType"],
    }),
    deleteClassType: build.mutation({
      query: (classTypeId) => ({
        url: `class/class-type/delete/${classTypeId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ClassType"],
    }),

    createClass: build.mutation({
      query: (body) => ({
        url: "/class/add",
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Class", "ClassType"],
    }),
    updateClass: build.mutation({
      query: (body) => ({
        url: "/class/edit",
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Class"],
    }),
    getAllClassType: build.query({
      query: () => ({
        url: "/class/class-type/",
        method: "GET",
      }),
      providesTags: ["ClassType"],
    }),
    getAllCategories: build.query({
      query: () => ({
        url: "/category/",
        method: "GET",
      }),
      providesTags: ["Category"],
    }),
    getAllClasses: build.query({
      query: () => ({
        url: "/class/",
        method: "GET",
      }),
      providesTags: ["ClassType"],
    }),
    deleteClassById: build.mutation({
      query: ({ classId }) => ({
        url: "/class/",
        method: "DELETE",
        body: { classId },
      }),
      invalidatesTags: ["ClassType"],
    }),
    updateClassType: build.mutation({
      query: (body) => ({
        url: `/class/class-type/edit`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["ClassType"],
    }),
    updateCategory: build.mutation({
      query: ({ categoryId, categoryName }) => ({
        url: `/category/edit`,
        method: "PUT",
        body: { categoryId, categoryName },
      }),
      invalidatesTags: ["Category"],
    }),
    updateBlog: build.mutation({
      query: ({
        id,
        title,
        body,
        categories,
        coverImageUrl,
        coverImagePublicId,
        authors,
        published,
      }) => ({
        url: `blog/update/${id}`, // Endpoint for updating the blog
        method: "PUT", // HTTP method
        body: {
          // Send the updated data
          title,
          body,
          categories,
          coverImageUrl,
          coverImagePublicId,
          authors,
          published,
        },
      }),
      invalidatesTags: [{ type: "Blog" }, { type: "ClassType" }],
    }),
    deleteCategory: build.mutation({
      query: ({ categoryId }) => ({
        url: `/category/delete`,
        method: "DELETE",
        body: { categoryId },
      }),
      invalidatesTags: ["Category"],
    }),

    // CHAT
    getChatList: build.query({
      query: () => ({
        url: "/chat/conversations",
        method: "GET",
      }),
      providesTags: ["chat", "messages"],
    }),
    createConversation: build.mutation({
      query: ({ userIdToAdd }) => ({
        url: `/chat/conversations/${userIdToAdd}`,
        method: "POST",
        body: { receiverId: userIdToAdd },
      }),
      invalidatesTags: ["chat"],
    }),
    deleteUserFromSideBar: build.mutation({
      query: (userIdToDelete) => ({
        url: "/chat/conversations/delete",
        method: "DELETE",
        body: userIdToDelete,
      }),
      invalidatesTags: ["chat"],
    }),

    getMessages: build.query({
      query: (receiverId) => ({
        url: "/chat/messages", // Define the endpoint
        method: "POST", // Use POST method
        body: { receiverId }, // Send receiverId in the body
      }),
      providesTags: ["chat", "messages"],
    }),

    // Inside your state/api.js where you define your API
    sendMessage: build.mutation({
      query: ({
        receiverId,
        text,
        imageUrl,
        videoUrl,
        cloudinaryImagePublicId,
        cloudinaryVideoPublicId,
      }) => ({
        url: `/chat/send/${receiverId}`,
        method: "POST",
        body: {
          text,
          imageUrl,
          videoUrl,
          cloudinaryImagePublicId,
          cloudinaryVideoPublicId,
        },
      }),
      invalidatesTags: ["chat", "messages"],
    }),

    // UPLOAD
    uploadImage: build.mutation({
      query: (imageBase64) => ({
        url: "/upload/photo",
        method: "POST",
        body: { imageBase64 },
      }),
    }),
    updateProfilePicture: build.mutation({
      query: ({ id, profilePicture, picturePublicId }) => ({
        url: `users/profilePicture/${id}`,
        method: "PUT",
        body: { profilePicture, picturePublicId },
      }),
    }),
    addMachine: build.mutation({
      query: (body) => ({
        url: `machines/add`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Machines"],
    }),
    getAllMachines: build.query({
      query: () => ({
        url: `machines/all`,
        method: "GET",
      }),
      providesTags: ["Machines"],
    }),
    getMachineById: build.query({
      query: (MachineId) => ({
        url: `machines/${MachineId}`,
        method: "GET",
      }),
      providesTags: ["Machines"],
    }),
    deleteMachineById: build.mutation({
      query: (MachineId) => ({
        url: `machines/${MachineId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Machines"],
    }),

    updateMachineById: build.mutation({
      query: ({ MachineId, ...body }) => ({
        url: `machines/${MachineId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Machines"],
    }),

    createExercise: build.mutation({
      query: ({ body }) => ({
        url: `exercises/create`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["exercises"],
    }),
    getAllExercises: build.query({
      query: () => ({
        url: `exercises/all`,
        method: "GET",
      }),
      providesTags: ["exercises"],
    }),
    getExerciseById: build.query({
      query: (exerciseId) => ({
        url: `exercises/exercise/${exerciseId}`,
        method: "GET",
      }),
      providesTags: ["exercises"],
    }),
    deleteExerciseById: build.mutation({
      query: (exerciseId) => ({
        url: `exercises/exercise/delete/${exerciseId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["exercises"],
    }),

    editExerciseById: build.mutation({
      query: ({ exerciseId, body }) => ({
        url: `exercises/exercise/edit/${exerciseId}`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["exercises"],
    }),
  }),
});

export const {
  useUpdateBlogMutation,
  useGetBlogByIdQuery,
  useGetAllClassesQuery,
  useCreateClassMutation,
  useUpdateClassTypeMutation,
  useCreateClassTypeMutation,
  useGetAllClassTypeQuery,
  useCreateBlogMutation,
  useGetBlogsPreviewByCurrentUserIdQuery,
  useRefreshMutation,
  useGetMessagesQuery,
  useLoginMutation,
  useLogoutMutation,
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetRolesQuery,
  useGetStatusQuery,
  useGetGymPlanQuery,
  useCreateGymPlanMutation,
  useUpdateGymPlanMutation,
  useDeleteGymPlanMutation,
  useGetSignatureQuery,
  useUpdateSignatureMutation,
  useGetAllPaymentsQuery,
  useGetPaymentsBySignatureIdQuery,
  useGetSignatureByIdQuery,
  useGetPaymentByIdQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,
  useGetGymPlanByIdQuery,
  useUploadImageMutation,
  useUpdateProfilePictureMutation,
  useCreateConversationMutation,
  useGetChatListQuery,
  useDeleteUserFromSideBarMutation,
  useSendMessageMutation,
  useGetAllUserFromGymPlanIdQuery,
  useGetLast7DaysUsersQuery,
  useCreateCategoryMutation,
  useGetAllCategoriesQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetAllEmployeesQuery,
  useUpdateClassMutation,
  useDeleteClassByIdMutation,
  useGetUsersForTreinadorQuery,
  useGetUserByIdForTreinadorQuery,

  // Machines
  useAddMachineMutation,
  useGetAllMachinesQuery,
  useGetMachineByIdQuery,
  useDeleteMachineByIdMutation,
  useUpdateMachineByIdMutation,

  // Exercises
  useCreateExerciseMutation,
  useGetAllExercisesQuery,
  useGetExerciseByIdQuery,
  useEditExerciseByIdMutation,
  useDeleteExerciseByIdMutation,
  // METRICS
  useUpdateMetricsByUserIdMutation,
  useGetMetricsByUserIdQuery,

  // Workout Plan
  useGetUserWorkoutPlanQuery,
  useCreateUserWorkoutPlanMutation,
  useEditUserWorkoutPlanMutation,

  useDeleteUserWorkoutPlanMutation,
  useDeleteBlogByIdMutation,
  useDeleteClassTypeMutation,
} = api;
