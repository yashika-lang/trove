import asyncHandler from "../exceptions/asyncHandler.js";
import ApiResponse from "../exceptions/ApiResponse.js";
import NotificationService from "../services/notification.service.js";

const notificationService = new NotificationService();

const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const result = await notificationService.getNotifications(req.user.company, {
    page,
    limit,
  });

  return res.status(200).json(
    new ApiResponse(200, result, "Notifications fetched successfully.")
  );
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(
    req.params.notificationId,
    req.user.company
  );

  return res.status(200).json(
    new ApiResponse(200, notification, "Notification marked as read.")
  );
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user.company);

  return res.status(200).json(
    new ApiResponse(200, null, "All notifications marked as read.")
  );
});

export { getNotifications, markAsRead, markAllAsRead };
