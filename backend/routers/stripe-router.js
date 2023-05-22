import { Router } from "express";
import Stripe from "stripe";
import bodyParser from "body-parser";
import { isAuthenticated } from "../middleware/auth.js";
import { User } from "../models/user.js";
import { config } from "../config.js";

const stripe = new Stripe(config.stripePrivateKey);

export const stripeRouter = Router();

stripeRouter.post(
  "/create-checkout-session",
  isAuthenticated,
  async (req, res) => {
    try {
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "cad",
              product_data: {
                name: "Web VR-TC Premium Membership",
              },
              unit_amount: 999,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${config.clientURL}/success`,
        cancel_url: `${config.clientURL}/dashboard`,
        client_reference_id: req.session.userId,
      });

      res.status(200).json(session.url);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

stripeRouter.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const payload = req.body;
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        payload,
        sig,
        config.stripeEndpointSecret
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = await stripe.checkout.sessions.retrieve(
        event.data.object.id
      );
      const userId = session.client_reference_id;

      const user = await User.findByPk(userId);
      user.premiumEnabled = true;
      await user.save();
    }

    res.status(200).end();
  }
);
