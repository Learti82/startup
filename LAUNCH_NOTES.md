# PronA — Kosovo Launch Notes

## Pre-launch Checklist

### Infrastructure
- [ ] Set strong `JWT_SECRET` (run: `openssl rand -hex 32`)
- [ ] Set strong `ENCRYPTION_KEY` (exactly 32 characters)
- [ ] Set `ANTHROPIC_API_KEY` for live AI analysis
- [ ] Configure PostgreSQL backups (daily, encrypted)
- [ ] Set up SSL/TLS termination (Cloudflare or nginx + certbot)
- [ ] Configure `FRONTEND_URL` to production domain

### Legal
- [ ] Draft Terms of Service (Albanian + English)
- [ ] Draft Privacy Policy compliant with Kosovo Law on Personal Data Protection
- [ ] Add legal disclaimer to all report PDFs
- [ ] Consult Kosovo Bar Association before marketing to lawyers

### Data Integrations (Future)
| Source | Data | Status |
|--------|------|--------|
| AKK (kk.rks-gov.net) | Cadastral parcel data | Planned |
| ARBK (arbk.rks-gov.net) | Company/developer registry | Planned |
| Municipal portals | Construction permits | Planned |
| Gjykata Supreme | Property court orders | Planned |

### Kosovo Launch Sequence
1. **Week 1–2**: Beta invite to 20 early users via WhatsApp/Viber groups
2. **Week 3–4**: Partnership with 2–3 Prishtinë real estate agencies
3. **Month 2**: Soft launch at Panairi i Pronës (property fair)
4. **Month 3**: Paid plans live; lawyer/notary outreach
5. **Month 4–6**: Bank due-diligence pilot (ProCredit, Raiffeisen Kosovo)

### Support Contacts (to be filled)
- Technical: dev@prona.ks
- Legal inquiries: legal@prona.ks
- Press: press@prona.ks
