/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Types for Minbee Chat Assistant
export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

export interface GeminiPart {
  text: string;
}

export interface GeminiContent {
  role: "user" | "model";
  parts: GeminiPart[];
}

// Types for Breastfeeding & Pumping Tracker
export type BottleFeedingMilliLitres = number;

export interface LogEntry {
  id: string;
  timestamp: string; // ISO String
  type: "nursing" | "pumping" | "diaper";
  
  // Nursing specific fields
  nursing?: {
    leftSeconds: number;
    rightSeconds: number;
    totalSeconds: number;
  };

  // Pumping specific fields
  pumping?: {
    leftMl: number;
    rightMl: number;
    totalMl: number;
    note?: string;
  };

  // Diaper specific fields
  diaper?: {
    status: "wet" | "dirty" | "both" | "dry";
    note?: string;
  };
}

// Types for Interactive Symptom / Troubleshooter
export interface SymptomStep {
  id: string;
  question: string;
  options: {
    label: string;
    score: number;
    advice: string;
    critical?: boolean;
  }[];
}

export interface BreastfeedingChallenge {
  id: string;
  title: string;
  icon: string;
  description: string;
  criticalSymptoms: string[];
  immediateSteps: string[];
  interactiveDiagnostic: SymptomStep[];
}

// Types for Consultation Estimator
export interface ServiceMaterial {
  title: string;
  type: "video" | "pdf";
  preview?: boolean; // shown unlocked as a free sample
}

export interface ServicePackage {
  id: string;
  name: string;
  category: "consultation" | "class";
  price: number;
  description: string;
  features: string[];
  image: string;
  materials?: ServiceMaterial[]; // digital deliverables (Kelas)
}
