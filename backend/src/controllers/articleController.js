const { Article, Family } = require('../models');

async function getArticles(req, res, next) {
  try {
    const { familyId, search, active = true } = req.query;
    const query = { active };

    if (familyId) query.familyId = familyId;
    if (search) {
      query.$or = [
        { sku: new RegExp(search, 'i') },
        { name: new RegExp(search, 'i') },
        { ean: search }
      ];
    }

    const articles = await Article.find(query).populate('familyId').sort({ name: 1 });
    res.json({ success: true, data: { articles } });
  } catch (error) {
    next(error);
  }
}

async function getArticle(req, res, next) {
  try {
    const article = await Article.findById(req.params.id).populate('familyId');
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    res.json({ success: true, data: { article } });
  } catch (error) {
    next(error);
  }
}

async function createArticle(req, res, next) {
  try {
    const article = new Article(req.body);
    await article.save();
    res.status(201).json({ success: true, message: 'Article created', data: { article } });
  } catch (error) {
    next(error);
  }
}

async function updateArticle(req, res, next) {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    res.json({ success: true, message: 'Article updated', data: { article } });
  } catch (error) {
    next(error);
  }
}

async function deleteArticle(req, res, next) {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    res.json({ success: true, message: 'Article deleted', data: { article } });
  } catch (error) {
    next(error);
  }
}

// Family endpoints
async function getFamilies(req, res, next) {
  try {
    const families = await Family.find({ active: true }).populate('parentFamilyId').sort({ name: 1 });
    res.json({ success: true, data: { families } });
  } catch (error) {
    next(error);
  }
}

async function createFamily(req, res, next) {
  try {
    const family = new Family(req.body);
    await family.save();
    res.status(201).json({ success: true, message: 'Family created', data: { family } });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  getFamilies,
  createFamily
};
