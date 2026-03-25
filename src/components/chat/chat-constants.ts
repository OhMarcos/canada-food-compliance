import type { ChatMessage } from "@/types/chat";

export const STORAGE_KEY = "cfc-chat-history";
export const METADATA_DELIMITER = "\n\n---METADATA---\n";

export interface Message {
  readonly id: string;
  readonly role: "user" | "assistant";
  readonly content: string;
  readonly chatMessage?: ChatMessage;
  readonly timestamp?: string;
  readonly processingTimeMs?: number;
}

export const SUGGESTED_QUESTIONS = [
  {
    ko: "캐나다에 식품을 수입하려면 어떤 라이선스가 필요한가요?",
    en: "What license do I need to import food into Canada?",
  },
  {
    ko: "캐나다에서 식품 라벨에 반드시 포함해야 하는 정보는 무엇인가요?",
    en: "What information must be included on food labels in Canada?",
  },
  {
    ko: "식품 수입 시 알레르기 유발 물질 표시 요건은?",
    en: "What are the allergen labelling requirements for imported food?",
  },
  {
    ko: "캐나다 식품 수입에 필요한 예방관리계획(PCP)이란 무엇인가요?",
    en: "What is a Preventive Control Plan (PCP) required for importing food to Canada?",
  },
  {
    ko: "식품 첨가물이 캐나다에서 허가된 것인지 어떻게 확인하나요?",
    en: "How do I verify that food additives are permitted in Canada?",
  },
  {
    ko: "캐나다 영양성분표(Nutrition Facts Table) 규격은 어떻게 되나요?",
    en: "What are the Canadian Nutrition Facts Table format requirements?",
  },
] as const;

export const LOADING_STEPS_EN = [
  { label: "Searching regulations...", delay: 0 },
  { label: "Generating answer...", delay: 1000 },
  { label: "Verifying...", delay: 0 },
] as const;

export const LOADING_STEPS_KO = [
  { label: "RAG 검색 중...", delay: 0 },
  { label: "답변 생성 중...", delay: 1000 },
  { label: "검증 중...", delay: 0 },
] as const;
