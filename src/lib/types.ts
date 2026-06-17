export type UserRole = 'admin' | 'editor'

export interface Profile {
  id: string
  email: string
  full_name?: string
  role: UserRole
  created_at: string
}

export type IdeaStatus = 'idea' | 'in_progress' | 'listed' | 'archived'

export interface ProductIdea {
  id: string
  created_by: string
  created_at: string
  updated_at: string
  age_group: string
  curriculum_areas: string[]
  theme: string
  seasonal_hook?: string
  title: string
  product_type: string
  suggested_price: string
  description: string
  hook: string
  tpt_tags: string[]
  status: IdeaStatus
  notes?: string
  target_launch_date?: string | null
  listing_copy?: ListingCopyStore | null
  canva_brief?: CanvaBrief | null
  resource_content?: ResourceTheme[] | null
  etsy_uploaded_at?: string | null
  tpt_uploaded_at?: string | null
  etsy_listing_url?: string | null
  tpt_listing_url?: string | null
  resource_outlines?: ResourceOutline[]
  seo_data?: SeoData[]
}

export type PlatformListing = {
  listing_title: string
  description: string
  etsy_tags?: string[]
  tpt_tags?: string[]
  price_aud: string
}

export type ListingCopyStore = {
  etsy?: PlatformListing
  tpt?: PlatformListing
}

export type CanvaBrief = {
  cover_title: string
  subtitle: string
  colour_palette: string
  font_suggestions: string
  layout_notes: string
  illustration_notes: string
  mood: string
  size_spec: string
}

export type ResourceCard = {
  label: string
  description: string
}

export type EylfOutcome = {
  outcome: string
  explanation: string
}

export type SupportingTextItem = {
  item_type: string
  content: string
}

export type ResourceTheme = {
  theme_name: string
  cards: ResourceCard[]
  eylf_outcomes: EylfOutcome[]
  how_to_use: string
  supporting_text: SupportingTextItem[]
}

export type CalendarIdea = {
  id: string
  title: string
  status: IdeaStatus
  product_type: string
  age_group: string
  target_launch_date: string
  hasIllustration: boolean
  etsyUploaded: boolean
  tptUploaded: boolean
}

export interface ResourceOutline {
  id: string
  product_idea_id: string
  created_at: string
  pack_title: string
  learning_outcomes: string[]
  eylf_links: string[]
  activities: Activity[]
  printables: string[]
  differentiation_tips: string
}

export interface Activity {
  name: string
  description: string
  materials: string
}

export interface SeoData {
  id: string
  product_idea_id: string
  created_at: string
  primary_keyword: string
  title_formula: string
  keywords: SeoKeyword[]
  description_opener: string
}

export interface SeoKeyword {
  keyword: string
  intent: 'buyer' | 'browser'
  competition: 'low' | 'medium' | 'high'
  auNzRelevance: 'high' | 'medium'
}

export interface GenerateRequest {
  ageGroup: string
  curriculumAreas: string[]
  theme: string
  seasonalHook?: string
  numIdeas: number
}

export interface GenerateResponse {
  ideas: GeneratedIdea[]
  outline: GeneratedOutline
  seo: GeneratedSeo
  error?: string
}

export interface GeneratedIdea {
  title: string
  type: string
  price: string
  description: string
  hook: string
  tags: string[]
}

export interface GeneratedOutline {
  packTitle: string
  learningOutcomes: string[]
  eylf: string[]
  activities: Activity[]
  printables: string[]
  differentiationTips: string
}

export interface GeneratedSeo {
  primaryKeyword: string
  titleFormula: string
  keywords: SeoKeyword[]
  descriptionOpener: string
}
