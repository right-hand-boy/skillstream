/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Date: { input: Date; output: Date };
  JSON: { input: object; output: object };
}

export type AcceptContractInputType = {
  accepted: Scalars["Boolean"]["input"];
  contract_id: Scalars["Int"]["input"];
};

export interface AdminFeedbackType {
  __typename?: "AdminFeedback";
  content: Scalars["String"]["output"];
  createdAt: Scalars["Date"]["output"];
  email: Scalars["String"]["output"];
  id: Scalars["Int"]["output"];
  name: Scalars["String"]["output"];
  subject: Scalars["String"]["output"];
  updatedAt: Scalars["Date"]["output"];
}

export interface ApplicationType {
  __typename?: "Application";
  Job: JobType;
  about_freelancer: Scalars["String"]["output"];
  createdAt: Scalars["Date"]["output"];
  freelancer: UserType;
  freelancer_id: Scalars["Int"]["output"];
  id: Scalars["Int"]["output"];
  job_id: Scalars["Int"]["output"];
  price_offer: Scalars["Float"]["output"];
  updatedAt: Scalars["Date"]["output"];
}

export type ApplyingInputType = {
  about_freelancer: Scalars["String"]["input"];
  employer_id: Scalars["Int"]["input"];
  job_id: Scalars["Int"]["input"];
  price_offer: Scalars["Float"]["input"];
};

export type ConfirmPaymentInputType = {
  paid: Scalars["Boolean"]["input"];
  payment_id: Scalars["Int"]["input"];
};

export interface ContractType {
  __typename?: "Contract";
  createdAt: Scalars["Date"]["output"];
  deadline_date: Scalars["Date"]["output"];
  employer: UserType;
  final_amount?: Scalars["Float"]["output"];
  freelancer: UserType;
  id: Scalars["Int"]["output"];
  job: JobType;
  offered_amount: Scalars["Float"]["output"];
  payment?: PaymentType;
  start_date: Scalars["Date"]["output"];
  status: Scalars["String"]["output"];
  updatedAt: Scalars["Date"]["output"];
}

export type CreateAdminFeedbackInputType = {
  content: Scalars["String"]["input"];
  email: Scalars["String"]["input"];
  name: Scalars["String"]["input"];
  subject: Scalars["String"]["input"];
};

export type CreateContractInputType = {
  deadline_date: Scalars["Date"]["input"];
  freelancer_id: Scalars["Int"]["input"];
  job_id: Scalars["Int"]["input"];
  offered_amount: Scalars["Float"]["input"];
  start_date: Scalars["Date"]["input"];
};

export type CreateFeedbackInputType = {
  to_id: number;
  content: string;
  rating: number;
};

export type CreateJobInputType = {
  description: Scalars["String"]["input"];
  name: Scalars["String"]["input"];
  skill_id?: Scalars["Int"]["input"];
};

export type CreatePaymentInputType = {
  amount: Scalars["Float"]["input"];
  contract_id: Scalars["Int"]["input"];
  freelancer_id: Scalars["Int"]["input"];
};

export type CreateUserInputType = {
  email: Scalars["String"]["input"];
  firstname: Scalars["String"]["input"];
  lastname: Scalars["String"]["input"];
  password: Scalars["String"]["input"];
  role: Scalars["String"]["input"];
  username: Scalars["String"]["input"];
};

export interface DashboardStatsType {
  __typename?: "DashboardStats";
  applicationsCount: Scalars["Int"]["output"];
  clientsCount: Scalars["Int"]["output"];
  contractsCount: Scalars["Int"]["output"];
  freelancers: Array<UserType>;
  freelancersCount: Scalars["Int"]["output"];
  jobsCount: Scalars["Int"]["output"];
  recentTransactions: Array<TransactionType>;
  transactionsCount: Scalars["Int"]["output"];
}

export type DepositMoneyInputType = {
  amount: Scalars["Float"]["input"];
  callBackUrl: Scalars["String"]["input"];
  email: Scalars["String"]["input"];
  first_name: Scalars["String"]["input"];
  last_name: Scalars["String"]["input"];
  phone_number: Scalars["String"]["input"];
  user_id: Scalars["Int"]["input"];
};

export type EditProfileInputType = {
  address: Scalars["String"]["input"];
  avatar?: Scalars["String"]["input"];
  bio: Scalars["String"]["input"];
  firstname: Scalars["String"]["input"];
  gender: Scalars["String"]["input"];
  id: Scalars["Int"]["input"];
  lastname: Scalars["String"]["input"];
  phone: Scalars["String"]["input"];
  portfolio_dir: Scalars["String"]["input"];
  skills: Array<Scalars["Int"]["input"]>;
};

export interface FeedbackType {
  __typename?: "Feedback";
  content: Scalars["String"]["output"];
  createdAt: Scalars["Date"]["output"];
  from: UserType;
  id: Scalars["Int"]["output"];
  seen: Scalars["Boolean"]["output"];
  to: UserType;
  updatedAt: Scalars["Date"]["output"];
}

export type FinalizeContractInputType = {
  deadline_date: Scalars["Date"]["input"];
  final_amount: Scalars["Float"]["input"];
  freelancer_id: Scalars["Int"]["input"];
  id: Scalars["Int"]["input"];
  job_id: Scalars["Int"]["input"];
  start_date: Scalars["Date"]["input"];
};

export type ImagePropType = {
  fileName?: Scalars["String"]["input"];
  name: Scalars["String"]["input"];
  size: Scalars["Int"]["input"];
  type: Scalars["String"]["input"];
  uri: Scalars["String"]["input"];
};

export interface JobType {
  __typename?: "Job";
  applications: Array<ApplicationType>;
  banned: Scalars["Boolean"]["output"];
  contracts: Array<ContractType>;
  createdAt: Scalars["Date"]["output"];
  description: Scalars["String"]["output"];
  employer: UserType;
  employer_id: Scalars["Int"]["output"];
  hasApplied: Scalars["Boolean"]["output"];
  id: Scalars["Int"]["output"];
  name: Scalars["String"]["output"];
  posted_date: Scalars["Date"]["output"];
  skill?: SkillType;
  status: Scalars["Boolean"]["output"];
  updatedAt: Scalars["Date"]["output"];
}

export type JobProgressInputType = {
  contract_id: Scalars["Int"]["input"];
  status: Scalars["Boolean"]["input"];
};

export interface LogedInUserType {
  __typename?: "LogedInUser";
  token: Scalars["JSON"]["output"];
  user: UserType;
}

export type LoginInputType = {
  email: Scalars["String"]["input"];
  password: Scalars["String"]["input"];
};

export interface MessageType {
  __typename?: "Message";
  content: Scalars["String"]["output"];
  createdAt: Scalars["Date"]["output"];
  id: Scalars["Int"]["output"];
  receiver: UserType;
  seen?: Scalars["Boolean"]["output"];
  sender: UserType;
  updatedAt: Scalars["Date"]["output"];
}

export type MessageInputType = {
  content: Scalars["String"]["input"];
  receiver_id: Scalars["Int"]["input"];
};

export interface MutationacceptContractArgsType {
  input?: AcceptContractInputType;
}

export interface MutationapplyForJobArgsType {
  input?: ApplyingInputType;
}

export interface MutationapproveJobReleaseFundArgsType {
  input: JobProgressInputType;
}

export interface MutationbanJobArgsType {
  ban: Scalars["Boolean"]["input"];
  job_id: Scalars["Int"]["input"];
}

export interface MutationbanUserArgsType {
  ban: Scalars["Boolean"]["input"];
  user_id: Scalars["Int"]["input"];
}

export interface MutationcloseJobArgsType {
  id: Scalars["Int"]["input"];
}

export interface MutationconfirmPaymentArgsType {
  input: ConfirmPaymentInputType;
}

export interface MutationcreateAdminFeedbackArgsType {
  input: CreateAdminFeedbackInputType;
}

export interface MutationcreateContractArgsType {
  input?: CreateContractInputType;
}

export interface MutationcreateFeedbackArgsType {
  input?: CreateFeedbackInputType;
}

export interface MutationcreateJobArgsType {
  input?: CreateJobInputType;
}

export interface MutationcreatePaymentArgsType {
  input: CreatePaymentInputType;
}

export interface MutationcreateSkillArgsType {
  name: Scalars["String"]["input"];
}

export interface MutationcreateUserArgsType {
  input?: CreateUserInputType;
}

export interface MutationdeleteUserArgsType {
  user_id: Scalars["Int"]["input"];
}

export interface MutationdepositMoneyArgsType {
  input?: DepositMoneyInputType;
}

export interface MutationeditProfileArgsType {
  input?: EditProfileInputType;
}

export interface MutationfinalizeContractArgsType {
  input?: FinalizeContractInputType;
}

export interface MutationjobProgressArgsType {
  input: JobProgressInputType;
}

export interface MutationloginUserArgsType {
  input?: LoginInputType;
}

export interface MutationrequestResetPasswordArgsType {
  email: Scalars["String"]["input"];
}

export interface MutationresetPasswordArgsType {
  email: Scalars["String"]["input"];
  newPassword: Scalars["String"]["input"];
  resetToken: Scalars["String"]["input"];
}

export interface MutationsendMessageArgsType {
  input: MessageInputType;
}

export interface MutationupdateProfileArgsType {
  input?: UpdateProfileInputType;
}

export interface NotificationType {
  __typename?: "Notification";
  createdAt: Scalars["Date"]["output"];
  id: Scalars["Int"]["output"];
  is_read?: Scalars["Boolean"]["output"];
  link: Scalars["JSON"]["output"];
  message: Scalars["String"]["output"];
  recipient?: UserType;
  seen?: Scalars["Boolean"]["output"];
  type: Scalars["String"]["output"];
  updatedAt: Scalars["Date"]["output"];
}

export interface PaymentType {
  __typename?: "Payment";
  amount: Scalars["Float"]["output"];
  checkout_url: Scalars["String"]["output"];
  contract: ContractType;
  createdAt: Scalars["Date"]["output"];
  employer: UserType;
  freelancer: UserType;
  id: Scalars["Int"]["output"];
  status: Scalars["String"]["output"];
  tx_ref: Scalars["String"]["output"];
  updatedAt: Scalars["Date"]["output"];
}

export interface PaymentURLType {
  __typename?: "PaymentURL";
  checkout_url: Scalars["String"]["output"];
}

export interface QueryfeedbacksByUserIdArgsType {
  id: Scalars["Int"]["input"];
}

export interface QueryuserArgsType {
  id: Scalars["Int"]["input"];
}

export interface SkillType {
  __typename?: "Skill";
  createdAt: Scalars["Date"]["output"];
  id: Scalars["Int"]["output"];
  jobs: Array<JobType>;
  name: Scalars["String"]["output"];
  updatedAt: Scalars["Date"]["output"];
  users: Array<UserType>;
}

export interface TokenType {
  __typename?: "Token";
  createdAt: Scalars["Date"]["output"];
  expiryDate: Scalars["Date"]["output"];
  id: Scalars["Int"]["output"];
  token: Scalars["String"]["output"];
  updatedAt: Scalars["Date"]["output"];
  user?: UserType;
}

export interface TransactionType {
  __typename?: "Transaction";
  amount: Scalars["Float"]["output"];
  from: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  status: Scalars["String"]["output"];
  to: Scalars["String"]["output"];
}

export type UpdateProfileInputType = {
  address: Scalars["String"]["input"];
  avatar?: Scalars["String"]["input"];
  bio: Scalars["String"]["input"];
  gender: Scalars["String"]["input"];
  id: Scalars["Int"]["input"];
  phone: Scalars["String"]["input"];
  portfolio_dir: Scalars["String"]["input"];
  skills: Array<Scalars["Int"]["input"]>;
};

export interface UserType {
  __typename?: "User";
  address?: Scalars["String"]["output"];
  avatar?: Scalars["String"]["output"];
  balance?: UserBalanceType;
  banned: Scalars["Boolean"]["output"];
  bio?: Scalars["String"]["output"];
  createdAt: Scalars["Date"]["output"];
  email: Scalars["String"]["output"];
  feedbacks: Array<FeedbackType>;
  firstname: Scalars["String"]["output"];
  fullname: Scalars["String"]["output"];
  gender?: Scalars["String"]["output"];
  id: Scalars["Int"]["output"];
  is_verified: Scalars["Boolean"]["output"];
  jobs: Array<JobType>;
  lastname: Scalars["String"]["output"];
  password: Scalars["String"]["output"];
  phone?: Scalars["String"]["output"];
  portfolio_dir?: Scalars["String"]["output"];
  resetToken?: Scalars["String"]["output"];
  resetTokenExpires?: Scalars["Date"]["output"];
  role: Scalars["String"]["output"];
  skills: Array<SkillType>;
  updatedAt: Scalars["Date"]["output"];
  username: Scalars["String"]["output"];
}

export interface UserBalanceType {
  __typename?: "UserBalance";
  balance: Scalars["Float"]["output"];
  createdAt: Scalars["Date"]["output"];
  id: Scalars["Int"]["output"];
  updatedAt: Scalars["Date"]["output"];
  user: UserType;
}

export interface UserSkillType {
  __typename?: "UserSkill";
  createdAt: Scalars["Date"]["output"];
  id: Scalars["Int"]["output"];
  skill: SkillType;
  updatedAt: Scalars["Date"]["output"];
  user: UserType;
}
