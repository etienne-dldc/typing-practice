import React from "react";
import {
  render,
  Mjml,
  MjmlHead,
  MjmlTitle,
  MjmlPreview,
  MjmlBody,
  MjmlSection,
  MjmlColumn,
  MjmlImage,
  MjmlText,
  MjmlFont,
} from "mjml-react";

export function loginOtpEmail(name: string, otp: string): string {
  const result = render(
    <MailLayout title="Code de connexion">
      <MjmlSection paddingBottom="10px" backgroundColor="#ffffff">
        <MjmlColumn verticalAlign="middle">
          <MjmlText align="center" fontSize="16px" fontFamily="SpaceGrotesk, sans-serif">
            Salut {name}, voici ton code de connexion
          </MjmlText>
        </MjmlColumn>
      </MjmlSection>
      <MjmlSection paddingTop="0" paddingBottom="0px" backgroundColor="#ffffff">
        <MjmlColumn></MjmlColumn>
        <MjmlColumn backgroundColor="#2196F3" borderRadius="6px" verticalAlign="middle">
          <MjmlText
            align="center"
            fontSize="20px"
            color="white"
            fontWeight={700}
            letterSpacing="3px"
            fontFamily="SpaceGrotesk, sans-serif"
          >
            {otp}
          </MjmlText>
        </MjmlColumn>
        <MjmlColumn></MjmlColumn>
      </MjmlSection>
      <MjmlSection paddingTop="10px" backgroundColor="#ffffff">
        <MjmlColumn verticalAlign="middle">
          <MjmlText align="center" fontSize="16px" lineHeight="1.6" fontFamily="SpaceGrotesk, sans-serif">
            {`Ce code est à usage unique et valide pendant 15 minutes.`}
          </MjmlText>
        </MjmlColumn>
      </MjmlSection>
    </MailLayout>
  );
  return result.html;
}

interface MailLayoutProps {
  title: string;
  children: React.ReactNode;
}

function MailLayout({ children, title }: MailLayoutProps): JSX.Element {
  return (
    <Mjml>
      <MjmlHead>
        <MjmlTitle>{title}</MjmlTitle>
        <MjmlPreview>{title}</MjmlPreview>
        <MjmlFont
          name="SpaceGrotesk, sans-serif"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
        />
      </MjmlHead>
      <MjmlBody backgroundColor="#fafafa">
        <MjmlSection />
        <MjmlSection backgroundColor="#263238">
          <MjmlColumn verticalAlign="middle">
            <MjmlImage src="https://training.etienne.tech/logo.png" width="200px" />
            <MjmlText
              align="center"
              fontSize="24px"
              color="white"
              fontWeight={700}
              fontFamily="SpaceGrotesk, sans-serif"
            >
              <a
                href="https://typing.etienne.tech/"
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "white",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                typing.etienne.tech
              </a>
            </MjmlText>
          </MjmlColumn>
        </MjmlSection>
        {children}
        <MjmlSection backgroundColor="#263238">
          <MjmlColumn verticalAlign="middle">
            <MjmlText align="center" fontSize="18px" fontFamily="SpaceGrotesk, sans-serif" color="white">
              <a href="https://training.etienne.tech/" target="_blank" rel="noreferrer" style={{ color: "white" }}>
                training.etienne.tech
              </a>
            </MjmlText>
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>
  );
}
