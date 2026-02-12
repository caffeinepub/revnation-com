import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Rating {
    createdAt: TimeValue;
    user: Principal;
    rating: number;
    reviewId: bigint;
}
export interface Comment {
    id: bigint;
    content: string;
    createdAt: TimeValue;
    hidden: boolean;
    author: Principal;
    reviewId: bigint;
}
export interface BrandLogo {
    logos: Array<[string, ImageType]>;
    brandName: string;
}
export type TimeValue = bigint;
export interface Score {
    value: number;
    design: number;
    comfort: number;
    performance: number;
}
export interface Bike {
    id: bigint;
    region: Region;
    colorOptions: Array<ColorOption>;
    name: string;
    createdBy: Principal;
    mainImages: Array<ImageType>;
    priceRange: PriceRange;
    specs: string;
    details: string;
    brand: string;
    brandLogo?: ImageType;
}
export interface Article {
    id: bigint;
    region: Region;
    status: ContentStatus;
    title: string;
    content: string;
    contentType?: ContentType;
    createdAt: TimeValue;
    createdBy: Principal;
    hidden: boolean;
    author: string;
    category: Category;
}
export interface ColorOption {
    colorCode: string;
    name: string;
    images: Array<ImageType>;
}
export interface PriceRange {
    max: bigint;
    min: bigint;
}
export type ImageType = {
    __kind__: "uploaded";
    uploaded: ExternalBlob;
} | {
    __kind__: "linked";
    linked: string;
};
export interface Review {
    id: bigint;
    region: Region;
    status: ContentStatus;
    title: string;
    content: string;
    contentType?: ContentType;
    cons: Array<string>;
    createdAt: TimeValue;
    createdBy: Principal;
    pros: Array<string>;
    hidden: boolean;
    author: string;
    score: Score;
    rating: number;
    bikeId: bigint;
}
export interface UserProfile {
    bio: string;
    name: string;
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
export enum ContentType {
    review = "review",
    news = "news"
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
    createBike(name: string, brand: string, specs: string, priceRange: PriceRange, mainImages: Array<ImageType>, details: string, region: Region, colorOptions: Array<ColorOption>, brandLogo: ImageType | null): Promise<bigint>;
    createComment(reviewId: bigint, content: string): Promise<bigint>;
    createOrSaveArticle(title: string, content: string, author: string, category: Category, region: Region, status: ContentStatus, contentType: ContentType | null): Promise<bigint>;
    createOrSaveReview(title: string, content: string, author: string, score: Score, bikeId: bigint, region: Region, status: ContentStatus, contentType: ContentType | null, pros: Array<string>, cons: Array<string>, rating: number): Promise<bigint>;
    deleteArticle(articleId: bigint): Promise<void>;
    deleteBike(bikeId: bigint): Promise<void>;
    deleteComment(commentId: bigint): Promise<void>;
    deleteReview(reviewId: bigint): Promise<void>;
    editBike(bikeId: bigint, name: string, brand: string, specs: string, priceRange: PriceRange, mainImages: Array<ImageType>, details: string, region: Region, colorOptions: Array<ColorOption>, brandLogo: ImageType | null): Promise<void>;
    getAllBikes(): Promise<Array<Bike>>;
    getAllPublishedArticles(): Promise<Array<Article>>;
    getAllPublishedReviews(): Promise<Array<Review>>;
    getBikeById(bikeId: bigint): Promise<Bike | null>;
    getBrandLogos(): Promise<Array<BrandLogo>>;
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
