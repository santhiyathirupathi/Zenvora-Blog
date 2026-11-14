const Category = require("../models/Category");
const Author = require("../models/Author");
const Blog = require("../models/Blog");
const User = require("../models/User");

const initialCategories = [
    {
        name: "Software Development",
        slug: "software-development",
        description: "Best practices, architecture, clean code, design patterns, and engineering workflows.",
        color: "#2563eb"
    },
    {
        name: "Artificial Intelligence & Machine Learning",
        slug: "artificial-intelligence-machine-learning",
        description: "Generative AI, neural networks, LLMs, NLP, and enterprise intelligent systems.",
        color: "#7c3aed"
    },
    {
        name: "Web and Mobile App Development",
        slug: "web-and-mobile-app-development",
        description: "Modern web frameworks, cross-platform apps, responsive UX, and scalable client apps.",
        color: "#059669"
    },
    {
        name: "Technology & Innovation",
        slug: "technology-innovation",
        description: "Breakthrough ideas, emerging hardware, quantum computing, and future tech trends.",
        color: "#ea580c"
    },
    {
        name: "Cybersecurity",
        slug: "cybersecurity",
        description: "Zero trust security, DevSecOps, data compliance, cryptography, and threat defense.",
        color: "#dc2626"
    },
    {
        name: "Cloud Computing",
        slug: "cloud-computing",
        description: "Serverless architectures, Kubernetes, multi-cloud strategy, CI/CD, and DevOps.",
        color: "#0891b2"
    },
    {
        name: "Industry Insights",
        slug: "industry-insights",
        description: "Market shifts, enterprise technology strategy, executive leadership, and case studies.",
        color: "#4f46e5"
    }
];

const initialAuthors = [
    {
        name: "Siddharth Raman",
        role: "Principal Solutions Architect",
        email: "siddharth.raman@techblog.io",
        bio: "Specializing in distributed systems, high-concurrency microservices, and modern cloud architectures.",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"
    },
    {
        name: "Ananya Deshmukh",
        role: "Lead AI Researcher",
        email: "ananya.d@techblog.io",
        bio: "Focusing on enterprise generative AI models, agentic workflows, and ethical machine learning deployments.",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300"
    },
    {
        name: "Kavitha Narayanan",
        role: "Head of Engineering",
        email: "kavitha.n@techblog.io",
        bio: "15+ years scaling tech teams, engineering culture, DevSecOps pipelines, and modern web platforms.",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300"
    }
];

const sampleBlogs = [
    {
        title: "Architecting Resilient Enterprise Microservices with Node.js & Kubernetes",
        slug: "architecting-resilient-enterprise-microservices",
        description: "A comprehensive guide on patterns, telemetry, and fault-tolerance mechanisms for enterprise-grade distributed systems.",
        category: "Software Development",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=85",
        featured: true,
        status: "published",
        author: "Siddharth Raman",
        authorRole: "Principal Solutions Architect",
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
        views: 1420,
        readingTime: 6,
        tags: ["Microservices", "Kubernetes", "NodeJS", "Architecture"],
        seoTitle: "Architecting Resilient Enterprise Microservices with Node.js",
        seoDescription: "Learn key architectural patterns and failover strategies for deploying fault-tolerant Node.js microservices on Kubernetes.",
        content: `# Architecting Resilient Enterprise Microservices with Node.js & Kubernetes

Modern enterprise software systems must be engineered from the ground up for high availability, fault isolation, and autonomous scalability. When building distributed microservices, unexpected network partitions, downstream latency, and resource starvation are inevitable.

In this deep-dive article, we examine foundational design principles inspired by enterprise cloud architectures.

## 1. The Circuit Breaker Pattern

In a distributed topology, a cascading failure occurs when one struggling dependency locks thread pools across multiple calling services. Implementing circuit breakers isolates degradation:

- **Closed State:** Normal request flow through the system.
- **Open State:** Downstream calls fail fast immediately without hogging resources.
- **Half-Open State:** Trial packets probe dependency recovery.

\`\`\`javascript
// Sample Circuit Breaker Wrapper
class CircuitBreaker {
  constructor(action, options = { failureThreshold: 3, timeout: 5000 }) {
    this.action = action;
    this.failureThreshold = options.failureThreshold;
    this.timeout = options.timeout;
    this.state = 'CLOSED';
    this.failureCount = 0;
  }

  async execute(...args) {
    if (this.state === 'OPEN') {
      throw new Error('Circuit is OPEN. Fast failover triggered.');
    }
    try {
      const result = await this.action(...args);
      this.reset();
      return result;
    } catch (err) {
      this.recordFailure();
      throw err;
    }
  }

  recordFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      setTimeout(() => { this.state = 'HALF-OPEN'; }, this.timeout);
    }
  }

  reset() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
}
\`\`\`

## 2. Structured Telemetry & OpenTelemetry

Tracing requests across boundaries requires ubiquitous correlation IDs passed via standard HTTP headers (\`traceparent\`).

| Telemetry Pillar | Purpose | Standard Tooling |
| :--- | :--- | :--- |
| **Distributed Tracing** | End-to-end request timeline | Jaeger, OpenTelemetry |
| **Structured Logs** | Contextual JSON execution logs | Winston, FluentBit |
| **Application Metrics** | Latency p95/p99 & throughput | Prometheus, Grafana |

> "Observability is not about collecting data; it is about asking arbitrary questions of your system without shipping new code."

## 3. Kubernetes Deployment Best Practices

Ensure your deployment manifests include rigorous health probes:
1. **Liveness Probe**: Restarts stuck event loops.
2. **Readiness Probe**: Prevents unprimed pods from receiving customer ingress traffic.
3. **Resource Requests & Limits**: Guarantees QoS tiers on shared worker nodes.

By adhering to these patterns, engineering teams achieve predictable uptime and rapid mean-time-to-recovery (MTTR).`
    },
    {
        title: "The Emergence of Agentic AI: Autonomous Workflows in Enterprise Software",
        slug: "emergence-of-agentic-ai-autonomous-workflows",
        description: "How autonomous reasoning agents are moving beyond chat interfaces to orchestrate complex multi-step enterprise workflows.",
        category: "Artificial Intelligence & Machine Learning",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=85",
        featured: true,
        status: "published",
        author: "Ananya Deshmukh",
        authorRole: "Lead AI Researcher",
        authorAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300",
        views: 2150,
        readingTime: 5,
        tags: ["AI", "LLMs", "MachineLearning", "Automation"],
        seoTitle: "The Emergence of Agentic AI in Modern Enterprise",
        seoDescription: "Explore how autonomous AI agents are revolutionizing enterprise productivity through tool use and multi-step reasoning.",
        content: `# The Emergence of Agentic AI: Autonomous Workflows in Enterprise Software

Artificial Intelligence is transitioning from static prompt-response paradigms into autonomous **Agentic Systems** capable of proactive planning, environment observation, and dynamic tool orchestration.



Traditional chat interfaces require continuous human intervention at each step. In contrast, agentic workflows follow a **ReAct loop (Reason + Act)**:

1. **Deconstruct Goal:** Formulate a structured step-by-step action plan.
2. **Tool Invocation:** Execute API calls, query internal vector databases, or run code interpreters.
3. **Observation & Reflection:** Inspect outputs and autonomously self-correct upon errors.

\`\`\`python
# Conceptual Agent Thought Loop
def execute_agent_goal(objective, tools):
    memory = []
    plan = generate_plan(objective)
    
    for task in plan:
        thought = reflect(memory, task)
        tool_call = select_tool(tools, task)
        result = tool_call.execute()
        memory.append({"task": task, "result": result})
        
    return summarize_findings(memory)
\`\`\`



- **Automated Root-Cause Analysis:** Agents parse server logs, correlate metrics anomalies, and generate draft pull requests.
- **Enterprise Knowledge Graph Extraction:** Ingesting unstructured PDF contracts and syncing relational tables.
- **Continuous Compliance Monitoring:** Verifying security posture against SOC2 and GDPR benchmarks automatically.

As AI models become more capable at self-reflection, organizations embracing agentic architectures will unlock unprecedented engineering leverage.`
    },
    {
        title: "Mastering Zero-Trust Architecture: A Modern Blueprint for DevSecOps",
        slug: "mastering-zero-trust-architecture-blueprint",
        description: "Moving from perimeter security to identity-driven microsegmentation and ephemeral credentials.",
        category: "Cybersecurity",
        image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1000&auto=format&fit=crop&q=85",
        featured: false,
        status: "published",
        author: "Kavitha Narayanan",
        authorRole: "Head of Engineering",
        authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300",
        views: 980,
        readingTime: 4,
        tags: ["Cybersecurity", "ZeroTrust", "DevSecOps", "Cloud"],
        seoTitle: "Mastering Zero-Trust Architecture in Cloud Systems",
        seoDescription: "A practical guide to implementing zero-trust access, mutual TLS, and short-lived credentials across modern cloud infrastructure.",
        content: `# Mastering Zero-Trust Architecture: A Modern Blueprint for DevSecOps

The classic castle-and-moat network security model is definitively obsolete. In modern multi-cloud hybrid setups, attackers who breach perimeter firewalls can move laterally undetected unless **Zero-Trust principles** are enforced at every communication layer.

## Core Pillars of Zero Trust

1. **Verify Explicitly:** Always authenticate and authorize based on all available data points (identity, device health, location).
2. **Use Least Privilege Access:** Grant just-in-time and just-enough-access (JIT/JEA) using short-lived tokens.
3. **Assume Breach:** Minimize blast radius and segment access. Encrypt all sessions end-to-end.

## Securing Machine-to-Machine Communication with mTLS

Service meshes like Istio and Linkerd provide cryptographic identity (SPIFFE) to each microservice container, ensuring:
- Mutual TLS encryption across internal clusters.
- Cryptographic attestation of service origin.
- Granular authorization policies enforced at the sidecar proxy level.`
    },
    {
        title: "Building High-Performance Web Applications with Next-Gen Rendering",
        slug: "building-high-performance-web-applications",
        description: "Optimizing Core Web Vitals, server components, and streaming hydration for ultra-fast digital experiences.",
        category: "Web and Mobile App Development",
        image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1000&auto=format&fit=crop&q=85",
        featured: false,
        status: "published",
        author: "Siddharth Raman",
        authorRole: "Principal Solutions Architect",
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
        views: 1150,
        readingTime: 4,
        tags: ["WebDev", "Performance", "React", "Frontend"],
        seoTitle: "Building High-Performance Web Applications in 2026",
        seoDescription: "Discover how streaming SSR, partial hydration, and asset preloading unlock sub-second load times on modern web apps.",
        content: `# Building High-Performance Web Applications with Next-Gen Rendering

Users demand instantaneous page transitions. Research consistently indicates that every 100-millisecond delay in load time directly degrades user engagement and conversion metrics.

## Key Performance Indicators: Core Web Vitals

- **LCP (Largest Contentful Paint):** Target under 2.0 seconds.
- **INP (Interaction to Next Paint):** Target under 150 milliseconds.
- **CLS (Cumulative Layout Shift):** Target under 0.1.

## Practical Optimization Checklist

1. Preload critical fonts using \`<link rel="preload">\`.
2. Serve images in modern formats (WebP/AVIF) with explicit width and height attributes to avoid layout shifts.
3. Defer non-critical JavaScript to keep the main thread idle for immediate user interactions.`
    },
    {
        title: "Multi-Cloud Strategy: Avoiding Vendor Lock-In Without Sacrificing Velocity",
        slug: "multi-cloud-strategy-avoiding-vendor-lockin",
        description: "How leading engineering organizations design infrastructure abstractions to leverage best-of-breed cloud offerings.",
        category: "Cloud Computing",
        image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&auto=format&fit=crop&q=85",
        featured: false,
        status: "published",
        author: "Kavitha Narayanan",
        authorRole: "Head of Engineering",
        authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300",
        views: 860,
        readingTime: 5,
        tags: ["Cloud", "DevOps", "Infrastructure", "MultiCloud"],
        seoTitle: "Multi-Cloud Strategy for Fast Scaling Tech Companies",
        seoDescription: "Strategic principles for balancing cloud portability and development speed with Kubernetes and Infrastructure as Code.",
        content: `# Multi-Cloud Strategy: Avoiding Vendor Lock-In Without Sacrificing Velocity

Adopting a multi-cloud posture offers distinct advantages: disaster resilience, regulatory compliance across geographical jurisdictions, and leverage in cost negotiations. However, naive multi-cloud implementations risk creating lowest-common-denominator infrastructure that slows down development cycles.

## Abstraction Layers that Matter

- **Container Runtime:** Docker and OCI-compliant containers.
- **Orchestration:** Managed Kubernetes (EKS, GKE, AKS).
- **Infrastructure as Code (IaC):** Terraform and OpenTofu modules.
- **Data Layer:** Multi-region replication databases with standard SQL/NoSQL drivers.

Focusing abstractions at the orchestration layer rather than proprietary cloud services strikes the ideal balance between developer agility and cloud independence.`
    },
    {
        title: "The Future of Developer Productivity in the Era of AI-Assisted Engineering",
        slug: "future-of-developer-productivity-ai-assisted",
        description: "Examining how generative coding assistants and automated testing redefine the role of the modern software engineer.",
        category: "Technology & Innovation",
        image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1000&auto=format&fit=crop&q=85",
        featured: false,
        status: "published",
        author: "Ananya Deshmukh",
        authorRole: "Lead AI Researcher",
        authorAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300",
        views: 1720,
        readingTime: 4,
        tags: ["AI", "Innovation", "Productivity", "SoftwareEngineering"],
        seoTitle: "The Future of Developer Productivity with AI",
        seoDescription: "How software teams are shifting from syntax generation to system architecture and validation in the age of AI coding assistants.",
        content: `# The Future of Developer Productivity in the Era of AI-Assisted Engineering

As AI coding assistants transition from rudimentary autocompletion to whole-codebase reasoning, the definition of engineering productivity is fundamentally evolving.

## Elevating Developers to System Architects

Rather than typing boilerplate syntax, developers increasingly operate as orchestrators and critical evaluators:
- **Spec-Driven Development:** Clear technical requirements and interface contracts guide AI synthesis.
- **Rigorous Verification:** Comprehensive automated test suites (unit, integration, regression) validate AI-generated logic.
- **Architecture & Security:** Evaluating tradeoffs in distributed state, consensus, and threat models.

The most productive engineering teams will be those that pair human intuition and architectural discipline with the velocity of AI assistance.`
    }
];

const seedDB = async () => {
    try {
       
        const adminEmail = "santya@gmail.com";
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            await User.create({
                name: "Lead Editorial Admin",
                email: adminEmail,
                password: "san123", 
                role: "admin"
            });
            console.log("Admin Account Create Sucessfully!");
        }

       
        const catCount = await Category.countDocuments();
        if (catCount === 0) {
            await Category.insertMany(initialCategories);
            console.log("Initial 7 categories seeded successfully!");
        }

       
        const authorCount = await Author.countDocuments();
        if (authorCount === 0) {
            await Author.insertMany(initialAuthors);
            console.log("Initial authors seeded successfully!");
        }

        
        for (const blog of sampleBlogs) {
            const exists = await Blog.findOne({ slug: blog.slug });
            if (!exists) {
                await Blog.create(blog);
                console.log(`Seeded article: ${blog.title}`);
            }
        }
    } catch (error) {
        console.error("DB Seed Error:", error.message);
    }
};

module.exports = seedDB;
