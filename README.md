# Leather Stock Insight

Design a minimal, modern Inventory Management Dashboard for a Leather Factory.

The dashboard should be clean, professional, and easy for factory staff to understand at a glance. Avoid excessive cards, charts, colors, and decorative elements.

Layout

Left Sidebar

Dashboard

Inventory

Incoming

Outgoing

Stock Movements

Suppliers

Customers

Reports

Settings

Top Header

Page title: "Inventory Dashboard"

Global search

Notifications icon

User profile

Main Dashboard

At the top, show only 4 KPI cards:

Total Stock

12,450 units

Incoming Today

850 units

Outgoing Today

420 units

Low Stock

8 Items

Below the cards:

Stock Overview

A simple clean chart showing:

Incoming

Outgoing

Allow filter:

7 Days

30 Days

3 Months

Recent Stock Movements

Show a simple table:

DateItemTypeQuantityReferenceTodayCow LeatherIncoming+500 Sq.ftIN-00125TodayGoat LeatherOutgoing-120 Sq.ftOUT-00089YesterdayLeather DyeIncoming+50 KgIN-00124

Use clear badges:

Incoming

Outgoing

Low Stock

Show a small table:

ItemCurrent StockMinimumStatusCow Leather120200LowLeather Dye15 Kg25 KgLow

Design

Minimal ERP-style UI

White/light background

Dark text

Subtle borders

Small rounded corners

Professional typography

Compact spacing

No unnecessary gradients

No large illustrations

No excessive animations

Use one consistent accent color

Desktop-first responsive design

The dashboard should feel like a simple industrial inventory system, not a generic SaaS landing page.

Focus only on the Dashboard landing page for now. Do not create detailed inventory forms or other module pages yet.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4f23eb02-25b5-44ea-95b0-d992aae339cc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
