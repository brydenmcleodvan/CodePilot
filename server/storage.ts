import {
  users,
  healthStats,
  connections,
  forumPosts,
  newsUpdates,
  products,
  type User,
  type InsertUser,
  type HealthStat,
  type InsertHealthStat,
  type Connection,
  type InsertConnection,
  type ForumPost,
  type InsertForumPost,
  type NewsUpdate,
  type InsertNewsUpdate,
  type Product,
  type InsertProduct
} from "@shared/schema";
import bcrypt from "bcryptjs";

// Modify the interface with any CRUD methods you might need
export interface IStorage {
  // User Management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;

  // Health Stats
  getUserHealthStats(userId: number): Promise<HealthStat[]>;
  addHealthStat(stat: InsertHealthStat): Promise<HealthStat>;

  // Connections
  getUserConnections(userId: number): Promise<{ connection: User, relationship: string, specific: string }[]>;
  addConnection(connection: InsertConnection): Promise<Connection>;
  removeConnection(userId: number, connectionId: number): Promise<boolean>;

  // Forum Posts
  getForumPosts(subreddit?: string): Promise<ForumPost[]>;
  getUserForumPosts(userId: number): Promise<ForumPost[]>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  updateForumPostVotes(id: number, upvote: boolean): Promise<ForumPost | undefined>;

  // News & Updates
  getNewsUpdates(limit?: number, category?: string): Promise<NewsUpdate[]>;
  createNewsUpdate(update: InsertNewsUpdate): Promise<NewsUpdate>;

  // Products
  getProducts(category?: string, recommendedFor?: string[]): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private healthStats: Map<number, HealthStat>;
  private connections: Map<number, Connection>;
  private forumPosts: Map<number, ForumPost>;
  private newsUpdates: Map<number, NewsUpdate>;
  private products: Map<number, Product>;

  private userIdCounter: number;
  private healthStatIdCounter: number;
  private connectionIdCounter: number;
  private forumPostIdCounter: number;
  private newsUpdateIdCounter: number;
  private productIdCounter: number;

  constructor() {
    this.users = new Map();
    this.healthStats = new Map();
    this.connections = new Map();
    this.forumPosts = new Map();
    this.newsUpdates = new Map();
    this.products = new Map();

    this.userIdCounter = 1;
    this.healthStatIdCounter = 1;
    this.connectionIdCounter = 1;
    this.forumPostIdCounter = 1;
    this.newsUpdateIdCounter = 1;
    this.productIdCounter = 1;

    // Add some initial data
    this.initializeData();
  }

  private async initializeData() {
    // Create some initial users
    const user1 = await this.createUser({
      username: "johndoe",
      password: await bcrypt.hash("password123", 10),
      email: "john.doe@example.com",
      name: "John Doe",
      profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      healthData: JSON.stringify({})
    });

    // Add health stats
    await this.addHealthStat({
      userId: 1,
      statType: "heart_rate",
      value: "72",
      unit: "bpm",
      icon: "ri-heart-pulse-line",
      colorScheme: "primary",
      timestamp: new Date()
    });

    await this.addHealthStat({
      userId: 1,
      statType: "sleep_quality",
      value: "7.8",
      unit: "hrs",
      icon: "ri-zzz-line",
      colorScheme: "warning",
      timestamp: new Date()
    });

    await this.addHealthStat({
      userId: 1,
      statType: "nutrient_status",
      value: "Zinc Deficient",
      icon: "ri-capsule-line",
      colorScheme: "accent",
      timestamp: new Date()
    });

    // Add news updates
    await this.createNewsUpdate({
      title: "New Study Links Zinc Levels to Immune Function",
      content: "Recent research shows strong correlation between zinc levels and overall immune system performance in adults.",
      thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      category: "Nutrition",
      timestamp: new Date()
    });

    await this.createNewsUpdate({
      title: "The Connection Between Sleep and Mental Wellbeing",
      content: "Experts highlight how quality sleep directly impacts mental health and cognitive function.",
      thumbnail: "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      category: "Mental Health",
      timestamp: new Date()
    });

    await this.createNewsUpdate({
      title: "How Genetics Influence Exercise Results",
      content: "New research reveals how genetic factors may explain varying results from identical exercise routines.",
      thumbnail: "https://images.unsplash.com/photo-1579126038374-6064e9370f0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      category: "Fitness",
      timestamp: new Date()
    });

    // Add products
    await this.createProduct({
      name: "Zinc Complex",
      description: "High-absorption zinc supplement with copper to support immune function.",
      price: "$24.99",
      image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
      category: "Supplements",
      tags: ["zinc", "immune", "recommended"],
      recommendedFor: ["zinc_deficiency"]
    });

    await this.createProduct({
      name: "Complete Multivitamin",
      description: "All-in-one vitamin formula with extra zinc for comprehensive support.",
      price: "$32.99",
      image: "https://images.unsplash.com/photo-1565071559227-20ab25b7685e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
      category: "Supplements",
      tags: ["multivitamin", "zinc", "recommended"],
      recommendedFor: ["zinc_deficiency", "general_health"]
    });

    await this.createProduct({
      name: "Immune Defense",
      description: "Comprehensive immune support with zinc, vitamin C, and elderberry.",
      price: "$29.99",
      image: "https://images.unsplash.com/photo-1622587034624-6f2ba1af11b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
      category: "Supplements",
      tags: ["immune", "zinc", "vitamin c", "popular"],
      recommendedFor: ["immune_support", "zinc_deficiency"]
    });

    await this.createProduct({
      name: "Zinc-Rich Foods Guide",
      description: "Comprehensive guide to incorporating zinc-rich foods into your diet.",
      price: "$12.99",
      image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
      category: "Books",
      tags: ["zinc", "food guide", "nutrition"],
      recommendedFor: ["zinc_deficiency", "nutrition_education"]
    });

    // Add forum posts
    await this.createForumPost({
      userId: 1,
      title: "Best food sources for zinc that aren't seafood or red meat?",
      content: "I recently found out I'm zinc deficient but I don't eat seafood or red meat. Looking for plant-based options that can help increase my zinc levels. Any advice appreciated!",
      subreddit: "Nutrition",
      upvotes: 128,
      downvotes: 5,
      tags: ["Zinc", "Plant-based", "Deficiency"],
      timestamp: new Date()
    });

    await this.createForumPost({
      userId: 1,
      title: "STUDY: New research links zinc levels to immune function and metabolism",
      content: "A new study published in the Journal of Nutritional Science has found significant correlations between zinc levels and both immune function and metabolic health. Here's what you need to know...",
      subreddit: "Nutrition",
      upvotes: 95,
      downvotes: 2,
      tags: ["Research", "Zinc", "Immunity"],
      timestamp: new Date()
    });

    await this.createForumPost({
      userId: 1,
      title: "My 30-day experience with zinc supplementation [Before & After]",
      content: "I decided to document my experience with zinc supplementation after discovering I had low levels. Here's how it affected my energy, skin health, and immune function over 30 days...",
      subreddit: "Nutrition",
      upvotes: 64,
      downvotes: 1,
      tags: ["Experience", "Zinc", "Supplements"],
      timestamp: new Date()
    });
  }

  // User Management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Health Stats
  async getUserHealthStats(userId: number): Promise<HealthStat[]> {
    return Array.from(this.healthStats.values()).filter(
      (stat) => stat.userId === userId
    );
  }

  async addHealthStat(stat: InsertHealthStat): Promise<HealthStat> {
    const id = this.healthStatIdCounter++;
    const newStat: HealthStat = { ...stat, id };
    this.healthStats.set(id, newStat);
    return newStat;
  }

  // Connections
  async getUserConnections(userId: number): Promise<{ connection: User, relationship: string, specific: string }[]> {
    const userConnections = Array.from(this.connections.values()).filter(
      (connection) => connection.userId === userId
    );
    
    const connectionsWithUsers = [];
    for (const connection of userConnections) {
      const connectedUser = await this.getUser(connection.connectionId);
      if (connectedUser) {
        connectionsWithUsers.push({
          connection: connectedUser,
          relationship: connection.relationshipType || "",
          specific: connection.relationshipSpecific || ""
        });
      }
    }
    
    return connectionsWithUsers;
  }

  async addConnection(connection: InsertConnection): Promise<Connection> {
    const id = this.connectionIdCounter++;
    const newConnection: Connection = { ...connection, id };
    this.connections.set(id, newConnection);
    return newConnection;
  }

  async removeConnection(userId: number, connectionId: number): Promise<boolean> {
    const connectionsToRemove = Array.from(this.connections.entries()).filter(
      ([_, connection]) => 
        connection.userId === userId && connection.connectionId === connectionId
    );
    
    for (const [id] of connectionsToRemove) {
      this.connections.delete(id);
    }
    
    return connectionsToRemove.length > 0;
  }

  // Forum Posts
  async getForumPosts(subreddit?: string): Promise<ForumPost[]> {
    let posts = Array.from(this.forumPosts.values());
    
    if (subreddit) {
      posts = posts.filter(post => post.subreddit === subreddit);
    }
    
    // Sort by newest first
    return posts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getUserForumPosts(userId: number): Promise<ForumPost[]> {
    return Array.from(this.forumPosts.values()).filter(
      (post) => post.userId === userId
    );
  }

  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const id = this.forumPostIdCounter++;
    const newPost: ForumPost = { ...post, id };
    this.forumPosts.set(id, newPost);
    return newPost;
  }

  async updateForumPostVotes(id: number, upvote: boolean): Promise<ForumPost | undefined> {
    const post = this.forumPosts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { 
      ...post, 
      upvotes: upvote ? post.upvotes + 1 : post.upvotes,
      downvotes: !upvote ? post.downvotes + 1 : post.downvotes
    };
    
    this.forumPosts.set(id, updatedPost);
    return updatedPost;
  }

  // News & Updates
  async getNewsUpdates(limit?: number, category?: string): Promise<NewsUpdate[]> {
    let updates = Array.from(this.newsUpdates.values());
    
    if (category) {
      updates = updates.filter(update => update.category === category);
    }
    
    // Sort by newest first
    updates = updates.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    if (limit && limit > 0) {
      updates = updates.slice(0, limit);
    }
    
    return updates;
  }

  async createNewsUpdate(update: InsertNewsUpdate): Promise<NewsUpdate> {
    const id = this.newsUpdateIdCounter++;
    const newUpdate: NewsUpdate = { ...update, id };
    this.newsUpdates.set(id, newUpdate);
    return newUpdate;
  }

  // Products
  async getProducts(category?: string, recommendedFor?: string[]): Promise<Product[]> {
    let productList = Array.from(this.products.values());
    
    if (category) {
      productList = productList.filter(product => product.category === category);
    }
    
    if (recommendedFor && recommendedFor.length > 0) {
      productList = productList.filter(product => 
        product.recommendedFor && 
        recommendedFor.some(tag => product.recommendedFor.includes(tag))
      );
    }
    
    return productList;
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }
}

export const storage = new MemStorage();
