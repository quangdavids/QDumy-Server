const Notification = require("../model/notificationSchema");
const Lecturer = require("../model/lecturerSchema")
const getNotification = async (req, res) => {
  try {
    const { userId } = req.params;
    const getNotification = await Notification.find({ userId: userId });

    res.status(200).json({
      message: "Fetch notifications successfully",
      notification: getNotification,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get notifications", err: err.message });
  }
};

const getLecturerNotification = async (req, res) => {
  try {
    const { userId } = req.params;
    const findLecturer = await Lecturer.findOne({lecturerId: userId})
    const getNotification = await Notification.find({ lecturerId: findLecturer._id });

    res.status(200).json({
      message: "Fetch notifications successfully",
      notification: getNotification,
      lecturer: findLecturer._id
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get notifications", err: err.message });
  }
};

const createNotification = async (req, res) => {
  try {
    const { userId, lecturerId, message, link } = req.body;
    const io = req.app.get('socketio'); 
    const createNotification = await Notification.create({
      userId: userId,
      lecturerId: lecturerId,
      message: message,
      link: link,
    });

    // Emit real-time notification
    if (userId) {
      io.to(userId.toString()).emit('new-notification', createNotification);
    }
    if (lecturerId) {
      io.to(lecturerId.toString()).emit('new-notification', createNotification);
    }

    res.status(200).json({
      message: "Create notification successfully",
      notification: createNotification,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create notifications", err: err.message });
  }
};

const readNotificationRealTime = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const io = req.app.get('socketio');

    const updateNotification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true },
    );
    
    // Emit update to specific user
    if (updateNotification.userId) {
      io.to(updateNotification.userId.toString()).emit('notification-read', updateNotification);
    }
    if (updateNotification.lecturerId) {
      io.to(updateNotification.lecturerId.toString()).emit('notification-read', updateNotification);
    }

    res.status(200).json({
      message: "Notification is read successfully",
      notification: updateNotification,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to read notifications", err: err.message });
  }
};

const deleteNotificationRealTime = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const io = req.app.get('socketio');

    const notification = await Notification.findByIdAndDelete(notificationId);
    
    // Emit deletion to specific user
    if (notification && notification.userId) {
      io.to(notification.userId.toString()).emit('notification-deleted', { notificationId });
    }
    if (notification && notification.lecturerId) {
      io.to(notification.lecturerId.toString()).emit('notification-deleted', { notificationId });
    }

    res.status(200).json({
      message: "Notification is deleted successfully",
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete notification", err: err.message });
  }
};

// const readNotification = async (req, res) => {
//   try {
//     const { notificationId } = req.params;

//     const updateNotification = await Notification.findByIdAndUpdate(
//       notificationId,
//       { isRead: true },
//       { new: true },
//     );
//     res
//       .status(200)
//       .json({
//         message: "Notification is read successfully",
//         notification: updateNotification,
//       });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Failed to read notifications", err: err.message });
//   }
// };

// const deleteNotification = async (req, res) => {
//   try {
//      const { notificationId } = req.params;

//       await Notification.findByIdAndDelete(notificationId)
//       res
//       .status(200)
//       .json({
//         message: "Notification is deleted successfully",
        
//       });
//   } catch (err) {
//       res
//       .status(500)
//       .json({ message: "Failed to delete notification", err: err.message });
//   }
// };

module.exports = { getNotification, getLecturerNotification, createNotification,  readNotificationRealTime, deleteNotificationRealTime };
