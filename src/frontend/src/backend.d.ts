import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    bio: string;
    name: string;
}
export interface Rating {
    createdAt: TimeValue;
    user: Principal;
    rating: number;
    reviewId: bigint;
}
export interface PriceRange {
    max: bigint;
    min: bigint;
}
export interface Comment {
    id: bigint;
    content: string;
    createdAt: TimeValue;
    hidden: boolean;
    author: Principal;
    reviewId: bigint;
}
export interface Bike {
    id: bigint;
    region: Region;
    name: string;
    createdBy: Principal;
    priceRange: PriceRange;
    specs: string;
    details: string;
    brand: string;
    images: Array<string>;
}
export interface Score {
    value: number;
    design: number;
    comfort: number;
    performance: number;
}
export type TimeValue = bigint;
export interface Article {
    id: bigint;
    region: Region;
    status: ContentStatus;
    title: string;
    content: string;
    createdAt: TimeValue;
    createdBy: Principal;
    hidden: boolean;
    author: string;
    category: Category;
}
export interface Review {
    id: bigint;
    region: Region;
    status: ContentStatus;
    title: string;
    content: string;
    createdAt: TimeValue;
    createdBy: Principal;
    hidden: boolean;
    author: string;
    score: Score;
    bikeId: bigint;
}
export enum Category {
    reviews = "reviews",
    comparisons = "comparisons",
    news = "news",
    concepts = "concepts",
    racing = "racing",
    electric = "electric",
    buyingGuides = "buyingGuides"
}
export enum ContentStatus {
    published = "published",
    draft = "draft"
}
export enum Region {
    usa = "usa",
    europe = "europe",
    asia = "asia",
    middleEast = "middleEast"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBike(name: string, brand: string, specs: string, priceRange: PriceRange, images: Array<string>, details: string, region: Region): Promise<bigint>;
    createComment(reviewId: bigint, content: string): Promise<bigint>;
    createOrSaveArticle(title: string, content: string, author: string, category: Category, region: Region, status: ContentStatus): Promise<bigint>;
    createOrSaveReview(title: string, content: string, author: string, score: Score, bikeId: bigint, region: Region, status: ContentStatus): Promise<bigint>;
    deleteArticle(articleId: bigint): Promise<void>;
    deleteBike(bikeId: bigint): Promise<void>;
    deleteComment(commentId: bigint): Promise<void>;
    deleteReview(reviewId: bigint): Promise<void>;
    editBike(bikeId: bigint, name: string, brand: string, specs: string, priceRange: PriceRange, images: Array<string>, details: string, region: Region): Promise<void>;
    getAllBikes(): Promise<Array<Bike>>;
    getAllPublishedArticles(): Promise<Array<Article>>;
    getAllPublishedReviews(): Promise<Array<Review>>;
    getBikeById(bikeId: bigint): Promise<Bike | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommentsByReview(reviewId: bigint): Promise<Array<Comment>>;
    getMyDraftArticles(): Promise<Array<Article>>;
    getMyDraftReviews(): Promise<Array<Review>>;
    getReviewRatings(reviewId: bigint): Promise<Array<Rating>>;
    getUserBikes(): Promise<Array<Bike>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hideArticle(articleId: bigint): Promise<void>;
    hideComment(commentId: bigint): Promise<void>;
    hideReview(reviewId: bigint): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    publishArticle(articleId: bigint): Promise<void>;
    publishReview(reviewId: bigint): Promise<void>;
    rateReview(reviewId: bigint, rating: number): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedPopularBikeEntries(): Promise<void>;
}
