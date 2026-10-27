const prisma = require('../prisma/client');

const contactController = {
  // Handle contact form submission
  submit: async (req, res, next) => {
    try {
      const { name, email, subject, message } = req.body;
      
      // Server-side Validation
      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Um e-mail válido é obrigatório.' });
      }
      if (!message || message.trim().length < 10) {
        return res.status(400).json({ error: 'A mensagem deve ter pelo menos 10 caracteres.' });
      }

      // Save to database
      const newMessage = await prisma.message.create({
        data: { name, email, subject, message }
      });

      // Log for immediate visibility
      console.log(`[CONTACT FORM] New message from ${name} (${email}): ${subject}`);
      console.log(`Content: ${message}`);

      res.status(201).json({ 
        success: true, 
        message: 'Message received successfully!',
        data: newMessage 
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = contactController;
