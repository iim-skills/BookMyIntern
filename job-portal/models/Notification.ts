import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface INotificationDocument extends Document {
  userId:    Types.ObjectId;
  title:     string;
  message:   string;
  type:      'application' | 'message' | 'system' | 'review';
  read:      boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title:   { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type:    { type: String, enum: ['application', 'message', 'system', 'review'], default: 'system' },
    read:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Bust cache on hot-reload if missing
if (mongoose.models.Notification) {
  delete mongoose.models.Notification;
}

const Notification: Model<INotificationDocument> =
  mongoose.models.Notification ||
  mongoose.model<INotificationDocument>('Notification', NotificationSchema);

export default Notification;
