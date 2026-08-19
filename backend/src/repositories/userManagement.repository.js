import User from "../models/user.model.js";

// ======================================================
// GET USERS
// ======================================================

const getUsersRepository = async (
  companyId,
  query = {},
  skip = 0,
  limit = 10,
  sort = { createdAt: -1 }
) => {
  return await User.find({
    company: companyId,
    ...query,
  })
    .select(
      "-password -refreshToken"
    )
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();
};


// ======================================================
// COUNT USERS
// ======================================================

const countUsersRepository = async (
  companyId,
  query = {}
) => {
  return await User.countDocuments({
    company: companyId,
    ...query,
  });
};


// ======================================================
// USER STATS
// ======================================================

const getUserStatsRepository = async (
  companyId
) => {

  const result =
    await User.aggregate([

      {
        $match: {
          company: companyId,
        },
      },

      {
        $group: {
          _id: null,

          totalUsers: {
            $sum: 1,
          },

          activeUsers: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "ACTIVE",
                  ],
                },
                1,
                0,
              ],
            },
          },

          pendingUsers: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "PENDING",
                  ],
                },
                1,
                0,
              ],
            },
          },

          inactiveUsers: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "INACTIVE",
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

  return (
    result[0] || {
      totalUsers: 0,
      activeUsers: 0,
      pendingUsers: 0,
      inactiveUsers: 0,
    }
  );
};


// ======================================================
// GET USER BY ID
// ======================================================

const getUserByIdRepository = async (
  userId,
  companyId
) => {

  return await User.findOne({
    _id: userId,
    company: companyId,
  })
    .select(
      "-password -refreshToken"
    )
    .lean();
};


// ======================================================
// FIND USER BY EMAIL
// ======================================================

const getUserByEmailRepository = async (
  email,
  companyId
) => {

  return await User.findOne({
    email: email.toLowerCase().trim(),
    company: companyId,
  });
};


// ======================================================
// CREATE USER
// ======================================================

const createUserRepository = async (
  userData
) => {

  return await User.create(
    userData
  );
};


// ======================================================
// UPDATE USER
// ======================================================

const updateUserRepository = async (
  userId,
  companyId,
  updateData
) => {

  return await User.findOneAndUpdate(
    {
      _id: userId,
      company: companyId,
    },
    updateData,
    {
      new: true,
      runValidators: true,
    }
  ).select(
    "-password -refreshToken"
  );
};


// ======================================================
// DELETE USER
// ======================================================

const deleteUserRepository = async (
  userId,
  companyId
) => {

  return await User.findOneAndDelete({
    _id: userId,
    company: companyId,
  });
};


export {
  getUsersRepository,
  countUsersRepository,
  getUserStatsRepository,
  getUserByIdRepository,
  getUserByEmailRepository,
  createUserRepository,
  updateUserRepository,
  deleteUserRepository,
};