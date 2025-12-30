import mongoose, { Schema, Document } from 'mongoose';


export interface ICounter extends Omit<Document, '_id'> {
  _id: string; // e.g. 'doctor', 'patient', etc.
  seq: number;
}

const CounterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 100 }, // Start from 100
});

export const Counter = mongoose.model<ICounter>('Counter', CounterSchema);
