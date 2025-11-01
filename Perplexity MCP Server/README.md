# 🚀 Perplexity MCP for Roo Code - Complete Guide

## 🎉 **Mission Accomplished!**

Your Roo Code now has **enterprise-grade research capabilities** with the official Perplexity MCP server! This upgrade provides **4 professional tools** instead of 1 basic search tool.

---

## 📁 **What's Included**

| File | Description |
|------|-------------|
| **🏗️ Setup Guide** | Technical setup details and troubleshooting |
| **📚 Examples** | Usage examples and best practices |
| **🏪 Distribution** | Marketplace explanation & alternatives |
| **🔧 Setup Script** | `setup-perplexity-mcp.sh` - **One-click installer** (recommended) |

---

## ⚡ **Quick Start (Recommended)**

### **One-Click Setup**
```bash
# Make executable
chmod +x setup-perplexity-mcp.sh

# Run setup (will prompt for API key)
./setup-perplexity-mcp.sh

# OR with API key as argument
./setup-perplexity-mcp.sh YOUR_API_KEY_HERE
```

### **What the Script Does**
- ✅ Checks prerequisites (Node.js, npm)
- ✅ Validates your Perplexity API key
- ✅ Finds your Roo Code config directory
- ✅ Creates/updates `mcp_settings.json`
- ✅ Configures all 4 Perplexity tools
- ✅ Creates backup of existing config
- ✅ Tests the server
- ✅ Provides clear next steps

---

## 🛠️ **Available Tools**

- ✅ **`perplexity_ask`** - Smart conversations with sonar-pro
- ✅ **`perplexity_search`** - Enhanced web search with metadata
- ✅ **`perplexity_research`** - Deep research with sonar-deep-research
- ✅ **`perplexity_reason`** - Advanced reasoning with sonar-reasoning-pro

---

## 🛠️ **Tool Details & Usage**

### 1. **perplexity_ask**
**Purpose**: General conversations with smart responses
**Model**: sonar-pro
**Best For**: Quick questions, everyday searches, casual conversations
**Cost**: Cheapest option

**Example Usage**:
```json
{
  "messages": [
    {
      "role": "user", 
      "content": "What are the latest trends in web development?"
    }
  ]
}
```

### 2. **perplexity_search**
**Purpose**: Web search with ranked results and metadata
**Best For**: Finding current information, research, fact-checking
**Cost**: Moderate

**Example Usage**:
```json
{
  "query": "React 18 best practices 2024",
  "max_results": 10,
  "max_tokens_per_page": 1024,
  "country": "US"
}
```

### 3. **perplexity_research**
**Purpose**: Deep, comprehensive research
**Model**: sonar-deep-research
**Best For**: Thorough analysis, detailed reports, complex research
**Cost**: Most expensive (comprehensive analysis)

**Example Usage**:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Provide a comprehensive analysis of climate change policies and their effectiveness"
    }
  ]
}
```

### 4. **perplexity_reason**
**Purpose**: Advanced reasoning and problem-solving
**Model**: sonar-reasoning-pro
**Best For**: Complex analytical tasks, logic problems, strategic thinking
**Cost**: Moderate

**Example Usage**:
```json
{
  "messages": [
    {
      "role": "user", 
      "content": "Analyze the trade-offs between centralized vs decentralized blockchain architectures"
    }
  ]
}
```

---

## 🚀 **What You Get**

### **🎯 Professional Features**
- **Citation Support** - All responses include sources
- **Multiple Models** - Different AI models for different tasks
- **Better Error Handling** - Robust timeouts and retries
- **Official Maintenance** - Supported by Perplexity team

### **📈 Performance Improvements**
- **TypeScript Implementation** with type safety
- **Standard MCP Protocol** compliance
- **Configurable timeouts** for different use cases

---

## 📋 **Usage in Roo Code**

### **Start Using Immediately**
1. **Restart VS Code** completely
2. **Start a task** in Roo Code
3. **Ask naturally** for research assistance:

**Examples:**
- *"Use perplexity_search to find React 18 tutorials"*
- *"Ask perplexity_ask about TypeScript best practices"*
- *"Use perplexity_research for comprehensive AI analysis"*
- *"Ask perplexity_reason to evaluate this architecture"*

### **Expected Behavior**
- Roo will automatically detect the 4 new Perplexity tools
- Responses will include citations when sources are available
- Different models will provide appropriate responses for their use cases

---

## 🔧 **Manual Setup (Alternative)**

If you prefer manual setup or the script doesn't work:

### **1. Get Your API Key**
Visit: https://www.perplexity.ai/account/api/group

### **2. Update Configuration**
Edit: `~/.config/[your-editor]/User/globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json`

```json
{
  "mcpServers": {
    "perplexity": {
      "command": "npx",
      "args": ["-y", "@perplexity-ai/mcp-server"],
      "env": {
        "PERPLEXITY_API_KEY": "YOUR_API_KEY_HERE",
        "PERPLEXITY_TIMEOUT_MS": "300000"
      },
      "alwaysAllow": [
        "perplexity_ask",
        "perplexity_search",
        "perplexity_research",
        "perplexity_reason"
      ],
      "disabled": false
    }
  }
}
```

### **3. Restart VS Code**
Close and reopen VS Code to activate the new tools.

---

## 📚 **Comprehensive Usage Examples**

### **1. perplexity_ask Examples**

#### **Quick Information Queries**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What are the main features of React 18?"
    }
  ]
}
```

#### **Technology Comparisons**
```json
{
  "messages": [
    {
      "role": "user", 
      "content": "Compare Next.js vs Nuxt.js for building modern web applications"
    }
  ]
}
```

#### **Code Pattern Questions**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What's the best way to implement error boundaries in React 18?"
    }
  ]
}
```

### **2. perplexity_search Examples**

#### **Technical Documentation Search**
```json
{
  "query": "TypeScript 5.0 new features documentation",
  "max_results": 5,
  "max_tokens_per_page": 1024,
  "country": "US"
}
```

#### **Library Compatibility Research**
```json
{
  "query": "Vue 3 vs React 2024 performance benchmarks",
  "max_results": 8,
  "country": "US"
}
```

#### **Tutorial Discovery**
```json
{
  "query": "React hooks tutorial advanced patterns 2024",
  "max_results": 10,
  "max_tokens_per_page": 512
}
```

### **3. perplexity_research Examples**

#### **Comprehensive Technology Analysis**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Provide a comprehensive analysis of web framework trends in 2024, including performance metrics, developer adoption rates, and future outlook. Focus on React, Vue, Angular, and emerging frameworks."
    }
  ]
}
```

#### **Deep Learning Research**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Research the current state of machine learning in web development. Include frameworks, tools, case studies, and practical applications for developers."
    }
  ]
}
```

#### **Industry Analysis**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Analyze the impact of serverless architecture on modern web development. Cover benefits, challenges, best practices, and real-world implementation examples."
    }
  ]
}
```

### **4. perplexity_reason Examples**

#### **Architecture Decisions**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Analyze the trade-offs between microservices vs monolithic architecture for a SaaS startup. Consider factors like team size, development speed, scalability, and maintenance overhead."
    }
  ]
}
```

#### **Problem-Solving Strategies**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Given a complex frontend application with performance issues, what systematic approach would you take to identify bottlenecks and optimize performance?"
    }
  ]
}
```

#### **Technical Strategy**
```json
{
  "messages": [
    {
      "role": "user", 
      "content": "Evaluate different approaches for implementing real-time features in web applications. Consider WebSockets, Server-Sent Events, polling, and their implications for scalability and user experience."
    }
  ]
}
```

---

## 🔄 **Workflow Examples**

### **Research Workflow**
```
1. Start with perplexity_search to find relevant sources
2. Use perplexity_ask to get a quick overview
3. Use perplexity_research for deep analysis
4. Use perplexity_reason for strategic insights
```

### **Development Workflow**
```
1. Use perplexity_search to find documentation
2. Use perplexity_ask for quick implementation guidance  
3. Use perplexity_reason for architectural decisions
4. Use perplexity_research for best practices
```

---

## 💡 **Advanced Usage Patterns**

### **Multi-Step Research**
```javascript
// Step 1: Initial search
const searchResults = await perplexity_search({
  query: "React 18 concurrent features",
  max_results: 10
});

// Step 2: Deep dive
const analysis = await perplexity_research({
  messages: [{
    role: "user",
    content: `Based on these results: ${searchResults}, 
    provide a comprehensive analysis of React 18 concurrent features`
  }]
});

// Step 3: Strategic thinking
const recommendations = await perplexity_reason({
  messages: [{
    role: "user", 
    content: "Given this analysis, what are the strategic implications 
    for migrating legacy React applications?"
  }]
});
```

### **Comparative Analysis**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Compare and contrast three different approaches to state management in modern React applications: Context API, Redux Toolkit, and Zustand. For each approach, analyze performance characteristics, developer experience, and suitable use cases."
    }
  ]
}
```

---

## 🧪 **Testing Your Integration**

### **Basic Test Queries**
1. **perplexity_ask**: "What time is it in UTC?"
2. **perplexity_search**: "React documentation latest"
3. **perplexity_research**: "Analyze the benefits of TypeScript"
4. **perplexity_reason**: "Evaluate micro-frontend architecture"

### **Validation Checklist**
- ✅ Tools appear in Roo Code tool list
- ✅ Responses include citations where applicable
- ✅ Error handling works for invalid queries
- ✅ Different models produce appropriate responses
- ✅ Timeout configuration works as expected

### **Sample Roo Code Prompts**

#### **Research Task**
```
Use perplexity_research to investigate the current state of web performance optimization in 2024. Include latest techniques, tools, and best practices with concrete examples.
```

#### **Decision Support**
```
Ask perplexity_reason to analyze the pros and cons of using GraphQL vs REST APIs for a new e-commerce application. Consider factors like development time, performance, and maintenance.
```

#### **Quick Information**
```
Use perplexity_ask to explain the difference between JavaScript async/await and Promises with practical examples.
```

#### **Documentation Search**
```
Search for the latest Next.js 14 features using perplexity_search and provide a summary of the most important updates for developers.
```

---

## 💰 **Cost Optimization Tips**

### **Efficient Tool Selection**
- **perplexity_ask**: Use for simple questions (cheapest)
- **perplexity_search**: Use when you need web results specifically
- **perplexity_research**: Use for comprehensive analysis (more expensive)
- **perplexity_reason**: Use for complex thinking (moderate cost)

### **Query Optimization**
- Be specific to avoid unnecessary token usage
- Break complex queries into smaller parts
- Use appropriate max_results for search queries
- Set reasonable timeouts based on query complexity

---

## 📋 **Configuration Details**

### **MCP Server Location**
```
~/.local/share/Roo-Code/MCP/perplexity-mcp/dist/index.js
```

### **Environment Variables**
```json
{
  "PERPLEXITY_API_KEY": "your-api-key-here",
  "PERPLEXITY_TIMEOUT_MS": "300000"
}
```

### **Timeout Configuration**
- **Default**: 5 minutes (300,000ms)
- **Long Research**: Increase `PERPLEXITY_TIMEOUT_MS` to 600000 (10 minutes)
- **Quick Questions**: Can reduce to 60000 (1 minute) for faster responses

### **Configuration File**
```json
{
  "mcpServers": {
    "perplexity": {
      "command": "node",
      "args": ["/path/to/perplexity-mcp/dist/index.js"],
      "env": {
        "PERPLEXITY_API_KEY": "your-key",
        "PERPLEXITY_TIMEOUT_MS": "300000"
      },
      "alwaysAllow": [
        "perplexity_ask",
        "perplexity_search", 
        "perplexity_research",
        "perplexity_reason"
      ],
      "disabled": false
    }
  }
}
```

---

## 🔧 **Troubleshooting**

### **Tools Not Appearing**
1. **Check API Key**: Verify `PERPLEXITY_API_KEY` is correct
2. **Restart VS Code**: Full restart, not just reload
3. **Check Logs**: Look in VS Code Developer Tools for errors

### **API Key Issues**
- Get your key from: https://www.perplexity.ai/account/api/group
- Ensure the key has sufficient credits
- Check if the key is active and valid

### **Connection Errors**
- Verify internet connection
- Check if the MCP server path is correct
- Ensure Node.js is available

### **Timeout Errors**
- Increase `PERPLEXITY_TIMEOUT_MS` for long queries
- Break complex queries into smaller parts
- Use async patterns for very long research

### **Common Issues**
1. **"Tool not found"** → Restart VS Code
2. **"API key invalid"** → Check key at perplexity.ai
3. **"Timeout errors"** → Increase timeout setting
4. **"Connection failed"** → Check server path and Node.js

---

## 🎯 **Why This Upgrade Matters**

### **For Research Tasks**
- **Better Sources** - Citation support for verification
- **Comprehensive Analysis** - Deep research capabilities
- **Multiple Perspectives** - Different models for different needs

### **For Development**
- **Current Information** - Up-to-date documentation and trends
- **Best Practices** - Research-backed recommendations
- **Problem Solving** - Advanced reasoning for complex issues

### **For Workflow**
- **Seamless Integration** - Natural language requests
- **Automatic Citations** - Built-in source attribution
- **Tool Variety** - Choose the right tool for the task

---

## 🚨 **Important Notes**

### **🔄 Restart Required**
- **VS Code must be completely restarted** (not just reloaded)
- **Wait 5-10 seconds** before reopening
- **Check tool list** in Roo Code after restart

### **🔑 API Key Security**
- **Store securely** - Don't share your API key
- **Monitor usage** - Check credits at perplexity.ai
- **Rotate if needed** - Generate new keys periodically

### **💰 Cost Management**
- **perplexity_ask** - Cheapest (simple conversations)
- **perplexity_search** - Moderate (web results)
- **perplexity_research** - Expensive (deep analysis)
- **perplexity_reason** - Moderate (complex thinking)

---

## 🔗 **Official Resources**

- **Documentation**: https://docs.perplexity.ai/guides/mcp-server
- **GitHub**: https://github.com/ppl-ai/modelcontextprotocol
- **Community**: https://community.perplexity.ai
- **API Key Management**: https://www.perplexity.ai/account/api/group

---

---

## 🏆 **Benefits Summary**

✅ **Professional Implementation** 
✅ **Citation Support**
✅ **Better Error Handling**
✅ **Official Maintenance**
✅ **TypeScript Support**
✅ **Configurable Timeouts**
✅ **Industry Standard MCP Protocol**

---

## 🎊 **You're All Set!**

Your Roo Code is now powered by the **official Perplexity MCP server** with **enterprise-grade research capabilities**.

### **Next Steps**
1. **Test the tools** with simple queries
2. **Explore advanced features** like citations and different models
3. **Integrate into your research workflow**

---

**Happy researching with Perplexity! 🚀**