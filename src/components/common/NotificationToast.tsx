import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { removeNotification } from "../../redux/slices/uiSlice";

const NotificationToast = () => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state) => state.ui);

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="text-green-500" size={20} />;
      case "error":
        return <AlertCircle className="text-red-500" size={20} />;
      case "warning":
        return <AlertTriangle className="text-yellow-500" size={20} />;
      default:
        return <Info className="text-blue-500" size={20} />;
    }
  };

  const getBackgroundColor = (type) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  useEffect(() => {
    const timers = notifications.map((notification) => {
      return setTimeout(() => {
        dispatch(removeNotification(notification.id));
      }, 5000);
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [notifications, dispatch]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-full">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`max-w-md w-full border rounded-lg shadow-lg p-4 ${getBackgroundColor(
            notification.type,
          )} animate-slide-in`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 break-words whitespace-pre-wrap">
                {notification.message}
              </p>
              {notification.description && (
                <p className="mt-1 text-sm text-gray-600 break-words whitespace-pre-wrap">
                  {notification.description}
                </p>
              )}
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => dispatch(removeNotification(notification.id))}
                className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
