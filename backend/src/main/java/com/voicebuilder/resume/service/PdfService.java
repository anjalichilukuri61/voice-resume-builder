package com.voicebuilder.resume.service;

import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.voicebuilder.resume.entity.Resume;
import com.voicebuilder.resume.entity.components.Education;
import com.voicebuilder.resume.entity.components.Experience;
import com.voicebuilder.resume.entity.components.ProjectDetails;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class PdfService {

    public byte[] generatePdf(Resume resume, String templateId) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Document document = new Document(com.lowagie.text.PageSize.A4, 36, 36, 36, 36);

        try {
            PdfWriter.getInstance(document, outputStream);
            document.open();

            // Font Definitions matching the image
            Font nameFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 22, Font.BOLD);
            Font contactFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 10);
            Font headerFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 12, Font.BOLD);
            Font boldBodyFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 10, Font.BOLD);
            Font bodyFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 10);

            com.lowagie.text.pdf.draw.VerticalPositionMark glue = new com.lowagie.text.pdf.draw.VerticalPositionMark();

            // 1. Header (Name and Contact)
            if (resume.getPersonalDetails() != null) {
                Paragraph name = new Paragraph(resume.getPersonalDetails().getFullName().toUpperCase(), nameFont);
                name.setAlignment(Paragraph.ALIGN_CENTER);
                document.add(name);

                // Contact Info
                java.util.List<String> contactParts = new java.util.ArrayList<>();
                if (resume.getPersonalDetails().getPhone() != null && !resume.getPersonalDetails().getPhone().isEmpty()) 
                    contactParts.add(resume.getPersonalDetails().getPhone());
                if (resume.getPersonalDetails().getEmail() != null && !resume.getPersonalDetails().getEmail().isEmpty()) 
                    contactParts.add(resume.getPersonalDetails().getEmail());
                if (resume.getPersonalDetails().getLinkedIn() != null && !resume.getPersonalDetails().getLinkedIn().isEmpty()) {
                    String li = resume.getPersonalDetails().getLinkedIn().replace("https://", "").replace("www.", "");
                    contactParts.add(li);
                }
                if (resume.getPersonalDetails().getGithubUrl() != null && !resume.getPersonalDetails().getGithubUrl().isEmpty()) {
                    String gh = resume.getPersonalDetails().getGithubUrl().replace("https://", "").replace("www.", "");
                    contactParts.add(gh);
                }
                
                String contactInfo = String.join(" — ", contactParts);
                Paragraph contact = new Paragraph(contactInfo, contactFont);
                contact.setAlignment(Paragraph.ALIGN_CENTER);
                contact.setSpacingAfter(10f);
                document.add(contact);
            }

            // Helper method for section headers
            java.util.function.Consumer<String> addSectionHeader = (title) -> {
                try {
                    Paragraph p = new Paragraph(title.toUpperCase(), headerFont);
                    p.setSpacingBefore(5f);
                    document.add(p);
                    com.lowagie.text.pdf.draw.LineSeparator ls = new com.lowagie.text.pdf.draw.LineSeparator();
                    ls.setLineWidth(0.5f);
                    document.add(new com.lowagie.text.Chunk(ls));
                } catch (Exception e) {}
            };

            // 2. EDUCATION
            if (resume.getEducationList() != null && !resume.getEducationList().isEmpty()) {
                addSectionHeader.accept("EDUCATION");
                for (Education edu : resume.getEducationList()) {
                    Paragraph p1 = new Paragraph();
                    p1.add(new com.lowagie.text.Chunk(edu.getInstitution(), boldBodyFont));
                    p1.add(new com.lowagie.text.Chunk(glue));
                    if (edu.getGradeOrCgpa() != null && !edu.getGradeOrCgpa().isEmpty()) {
                        p1.add(new com.lowagie.text.Chunk("CGPA: " + edu.getGradeOrCgpa(), boldBodyFont));
                    }
                    document.add(p1);

                    Paragraph p2 = new Paragraph(edu.getDegree(), bodyFont);
                    p2.setSpacingAfter(3f);
                    document.add(p2);
                }
            }

            // 3. TECHNICAL SKILLS
            if (resume.getSkills() != null && !resume.getSkills().isEmpty()) {
                addSectionHeader.accept("TECHNICAL SKILLS");
                for (String skillLine : resume.getSkills()) {
                    Paragraph p = new Paragraph();
                    p.setIndentationLeft(10f);
                    p.setSpacingAfter(4f); // Added for vertical spacing between categories
                    p.add(new com.lowagie.text.Chunk("• ", boldBodyFont));
                    
                    int colonIndex = skillLine.indexOf(":");
                    if (colonIndex != -1) {
                        p.add(new com.lowagie.text.Chunk(skillLine.substring(0, colonIndex + 1), boldBodyFont));
                        p.add(new com.lowagie.text.Chunk(skillLine.substring(colonIndex + 1), bodyFont));
                    } else {
                        p.add(new com.lowagie.text.Chunk(skillLine, bodyFont));
                    }
                    document.add(p);
                }
            }

            // 4. PROFESSIONAL EXPERIENCE
            if (resume.getExperienceList() != null && !resume.getExperienceList().isEmpty()) {
                addSectionHeader.accept("PROFESSIONAL EXPERIENCE");
                for (Experience exp : resume.getExperienceList()) {
                    Paragraph p1 = new Paragraph(new com.lowagie.text.Chunk(exp.getJobTitle(), boldBodyFont));
                    p1.setIndentationLeft(10f);
                    document.add(p1);

                    Paragraph p2 = new Paragraph();
                    p2.setIndentationLeft(10f);
                    p2.add(new com.lowagie.text.Chunk(exp.getCompanyName(), bodyFont));
                    p2.add(new com.lowagie.text.Chunk(glue));
                    String dates = exp.getStartDate() + " – " + (exp.getIsCurrentJob() != null && exp.getIsCurrentJob() ? "Present" : exp.getEndDate());
                    p2.add(new com.lowagie.text.Chunk(dates, bodyFont));
                    document.add(p2);

                    if (exp.getResponsibilities() != null) {
                        for (String resp : exp.getResponsibilities()) {
                            Paragraph p3 = new Paragraph("• " + resp, bodyFont);
                            p3.setIndentationLeft(10f);
                            document.add(p3);
                        }
                    }
                    document.add(new Paragraph("\n"));
                }
            }

            // 5. PROJECTS
            if (resume.getProjectList() != null && !resume.getProjectList().isEmpty()) {
                addSectionHeader.accept("PROJECTS");
                for (ProjectDetails proj : resume.getProjectList()) {
                    Paragraph p1 = new Paragraph();
                    p1.setIndentationLeft(10f);
                    p1.add(new com.lowagie.text.Chunk(proj.getProjectName(), boldBodyFont));
                    if (proj.getTechnologiesUsed() != null && !proj.getTechnologiesUsed().isEmpty()) {
                        p1.add(new com.lowagie.text.Chunk(" — " + String.join(", ", proj.getTechnologiesUsed()), boldBodyFont));
                    }
                    document.add(p1);
                    
                    if (proj.getDescription() != null) {
                        for (String desc : proj.getDescription()) {
                            Paragraph p3 = new Paragraph("• " + desc, bodyFont);
                            p3.setIndentationLeft(10f);
                            document.add(p3);
                        }
                    }
                    document.add(new Paragraph("\n"));
                }
            }

            // 6. CERTIFICATIONS
            if (resume.getCertifications() != null && !resume.getCertifications().isEmpty()) {
                addSectionHeader.accept("CERTIFICATIONS");
                for (String cert : resume.getCertifications()) {
                    Paragraph p = new Paragraph("• " + cert, bodyFont);
                    document.add(p);
                }
            }

            document.close();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error generating PDF: " + e.getMessage());
        }

        return outputStream.toByteArray();
    }
}
