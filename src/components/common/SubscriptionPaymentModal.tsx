import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { X, CreditCard, Check } from "lucide-react";
import { useInitializePaymentMutation } from "../../redux/api/paymentsApi";
import { addNotification } from "../../redux/slices/uiSlice";

const SubscriptionPaymentModal = ({ isOpen, onClose, plan, plans = [] }) => {
  const dispatch = useDispatch();
  const [initializePayment, { isLoading }] = useInitializePaymentMutation();
  const [selectedPlan, setSelectedPlan] = useState(plan?.id || "");

  if (!isOpen) return null;

  const currentPlan = plan || plans.find((p) => p.id === parseInt(selectedPlan));

  const handlePayment = async () => {
    if (!selectedPlan && !plan) {
      dispatch(
        addNotification({
          type: "error",
          message: "Please select a plan",
        })
      );
      return;
    }

    const planToPayFor = currentPlan;

    try {
      const result = await initializePayment({
        amount: parseFloat(planToPayFor.price) * 100,
        subscription_plan_id: planToPayFor.id,
        callback_url: `${window.location.origin}/payment/callback`,
      }).unwrap();

      // Redirect to Paystack payment page
      if (result.data?.authorization_url) {
        window.location.href = result.data.authorization_url;
      } else {
        dispatch(
          addNotification({
            type: "success",
            message: "Subscription activated successfully!",
          })
        );
        onClose();
      }
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          message:
            error.data?.message || "Payment initialization failed",
        })
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {plan ? "Upgrade Your Plan" : "Choose Your Subscription"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {plan ? (
              // Single plan view
              <div>
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold text-green-600">
                      ₦{parseFloat(plan.price).toLocaleString()}
                    </span>
                    <span className="text-gray-600 ml-2">/{plan.duration}</span>
                  </div>

                  <ul className="space-y-2">
                    {plan.features && plan.features.length > 0 ? (
                      plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-gray-700">
                          <Check size={16} className="text-green-600 mr-2" />
                          {feature}
                        </li>
                      ))
                    ) : (
                      <li className="flex items-center text-gray-700">
                        <Check size={16} className="text-green-600 mr-2" />
                        {plan.ad_limit === -1
                          ? "Unlimited ads"
                          : `Post up to ${plan.ad_limit} ads`}
                      </li>
                    )}
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Payment Information
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Secure payment via Paystack</li>
                    <li>• Instant activation after payment</li>
                    <li>• Full refund if not satisfied</li>
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={isLoading}
                    className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    <CreditCard size={16} />
                    <span>{isLoading ? "Processing..." : "Subscribe Now"}</span>
                  </button>
                </div>
              </div>
            ) : (
              // Multiple plans view
              <div>
                <p className="text-gray-600 mb-6">
                  Select a plan that best fits your needs
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {plans.map((p) => (
                    <label
                      key={p.id}
                      className={`block p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedPlan === p.id.toString()
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="plan"
                        value={p.id}
                        checked={selectedPlan === p.id.toString()}
                        onChange={(e) => setSelectedPlan(e.target.value)}
                        className="sr-only"
                      />
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {p.name}
                      </h4>
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        ₦{parseFloat(p.price).toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {p.duration}
                      </p>
                      <p className="text-xs text-gray-500">
                        {p.ad_limit === -1
                          ? "Unlimited ads"
                          : `Up to ${p.ad_limit} ads`}
                      </p>
                    </label>
                  ))}
                </div>

                {currentPlan && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">
                      {currentPlan.name} Features
                    </h4>
                    <ul className="space-y-2">
                      {currentPlan.features && currentPlan.features.length > 0 ? (
                        currentPlan.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-center text-gray-700 text-sm"
                          >
                            <Check size={14} className="text-green-600 mr-2" />
                            {feature}
                          </li>
                        ))
                      ) : (
                        <li className="flex items-center text-gray-700 text-sm">
                          <Check size={14} className="text-green-600 mr-2" />
                          {currentPlan.ad_limit === -1
                            ? "Unlimited ads per month"
                            : `Post up to ${currentPlan.ad_limit} ads`}
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={!selectedPlan || isLoading}
                    className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    <CreditCard size={16} />
                    <span>{isLoading ? "Processing..." : "Continue to Payment"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPaymentModal;
