import raw from '../../data/learning.json'
import type { LearningArticle, LearningResource } from './types'

export const learningArticles = raw.articles as LearningArticle[]
export const learningResources = raw.resources as LearningResource[]
export const learningUpdated = raw.updated
