# yFiles for HTML Installation Guide

## Overview

NetSpider Pilot uses **yFiles for HTML**, a commercial diagramming library from yWorks. The application code is complete and ready to use, but yFiles itself must be manually installed due to licensing requirements.

## Why Manual Installation?

yFiles for HTML is a **commercial product** and cannot be automatically downloaded or redistributed without a valid license from yWorks. While an evaluation license is included in this repository (`lib/license.json`), the actual library package must be obtained directly from yWorks.

## Installation Steps

### Step 1: Request yFiles Evaluation License

1. Visit the yFiles evaluation page:
   ```
   https://www.yworks.com/products/yfiles-for-html/evaluate
   ```

2. Fill out the evaluation form with your details
   - The evaluation is **FREE** and takes just a few minutes
   - You'll receive access to download yFiles for HTML

3. After submitting, you'll receive:
   - Access to the yWorks customer portal (my.yworks.com)
   - Download link for yFiles for HTML package

### Step 2: Download yFiles Package

1. Log in to [my.yworks.com](https://my.yworks.com/)

2. Navigate to **Downloads** section

3. Download **yFiles for HTML** version **30.0.x** or later
   - Choose the npm package format (`.tgz` file)
   - File will be named something like: `yfiles-30.0.4+eval.tgz`

### Step 3: Install yFiles in This Project

1. Place the downloaded `.tgz` file in the `lib/` directory:
   ```bash
   cp ~/Downloads/yfiles-30.0.4+eval.tgz ./lib/
   ```

2. Update `package.json` to reference the yFiles package:
   ```json
   {
     "dependencies": {
       ...
       "yfiles": "file:./lib/yfiles-30.0.4+eval.tgz",
       ...
     }
   }
   ```
   
   **Note:** Adjust the filename to match your downloaded version.

3. Install dependencies:
   ```bash
   npm install
   ```

### Step 4: Verify Installation

Run the check script:
```bash
node scripts/check-yfiles.js
```

You should see:
```
✅ yFiles package found in lib/ directory
   Installation complete!
```

### Step 5: Start the Application

```bash
npm start
```

Open your browser to [http://localhost:4200](http://localhost:4200)

## Alternative: Use yFiles Dev Suite

If you prefer a GUI-based setup:

```bash
npx yfiles-dev-suite
```

This will:
- Open a web interface at http://localhost:4343
- Guide you through downloading yFiles
- Help scaffold new yFiles applications
- Provide access to 100+ demo applications

## Troubleshooting

### "Module 'yfiles' not found"

**Problem:** yFiles package is not installed

**Solution:** Follow steps 1-3 above to download and install yFiles

### "License expired" or "Invalid license"

**Problem:** The included evaluation license has expired

**Solution:** Request a new evaluation license from yWorks (Step 1)

### npm install fails with yFiles errors

**Problem:** Wrong yFiles package version or corrupted download

**Solution:**
1. Verify the downloaded file is a valid `.tgz` file
2. Check the filename matches the one in `package.json`
3. Re-download from my.yworks.com if necessary

### Build errors after yFiles installation

**Problem:** Version mismatch or incomplete installation

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## License Information

- **Evaluation License:** Valid until March 9, 2026
- **License File:** `lib/license.json`
- **Product:** yFiles for HTML 3.0+
- **License Type:** Evaluation (watermarked)

### What the Evaluation License Allows

✅ Full feature access
✅ Use on localhost
✅ Development and testing
✅ Internal demonstrations
✅ File system access

❌ Public deployment without purchasing a production license

## Next Steps After Installation

Once yFiles is installed:

1. **Load Sample Data:**
   - Click "Load" button in toolbar
   - Choose from 11 network topologies

2. **Explore Features:**
   - Drag nodes to reposition
   - Use mouse wheel to zoom
   - Click nodes/edges for details
   - Try auto-layout and re-routing

3. **Toggle Floor Plan:**
   - Click the 🖼️ button in toolbar
   - Background image toggles on/off

4. **Export Diagrams:**
   - Export as PNG, SVG, PDF, or JSON
   - Includes all visual formatting

## Support

### yFiles-Specific Questions

- **yFiles Documentation:** https://docs.yworks.com/yfiles-html/
- **yFiles Demos:** https://live.yworks.com/demos/
- **yWorks Support:** support@yworks.com

### NetSpider Pilot Questions

- Check existing documentation in `docs/`
- Review README.md for feature overview
- Inspect code comments for implementation details

## Important Notes

1. **Do NOT commit the yFiles package to git**
   - The `.gitignore` file excludes `lib/yfiles-*.tgz`
   - This prevents license violations

2. **License Compliance**
   - yFiles is commercial software
   - Respect the license terms
   - Contact yWorks for production use

3. **Updates**
   - Check my.yworks.com for newer versions
   - Update `package.json` reference if upgrading

## Quick Reference

```bash
# Check if yFiles is installed
node scripts/check-yfiles.js

# Install dependencies (after placing yFiles in lib/)
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

---

**Ready to get started?** Follow Step 1 above to request your free evaluation license!
