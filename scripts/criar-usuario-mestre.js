/**
 * Script para criar usuário mestre no Supabase
 * 
 * INSTRUÇÕES:
 * 1. Execute: node scripts/criar-usuario-mestre.js
 * 2. O script criará um usuário mestre com as credenciais abaixo
 * 3. Altere as credenciais no código antes de executar
 * 
 * IMPORTANTE: Este é um script temporário para setup inicial.
 * Após criar o usuário, você pode deletar este arquivo.
 */

import { createClient } from '@supabase/supabase-js';

// =========================================
// CONFIGURAÇÕES - ALTERE AQUI
// =========================================
const CONFIG = {
  email: 'admin@tatame.com',
  password: 'SenhaSegura123!',
  fullName: 'Administrador',
  phone: ''
};

// Credenciais do Supabase (já configuradas no projeto)
const SUPABASE_URL = "https://hsqlsrdsljlvideihevy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzcWxzcmRzbGpsdmlkZWloZXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MDk5OTQsImV4cCI6MjA3MzM4NTk5NH0.guK4SoN6L5KINJg7FPVlnq9IqIbNdIOwilHqcdNv3EQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function criarUsuarioMestre() {
  console.log('🚀 Iniciando criação de usuário mestre...\n');
  console.log(`📧 Email: ${CONFIG.email}`);
  console.log(`👤 Nome: ${CONFIG.fullName}`);
  console.log(`🔑 Tipo: Mestre\n`);

  try {
    // 1. Criar usuário no Supabase Auth
    console.log('1️⃣ Criando usuário no sistema de autenticação...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: CONFIG.email,
      password: CONFIG.password,
      options: {
        data: {
          full_name: CONFIG.fullName,
          user_type: 'mestre',
          phone: CONFIG.phone || ''
        }
      }
    });

    if (signUpError) {
      // Se o usuário já existe, tentar fazer login e atualizar o perfil
      if (signUpError.message.includes('already registered') || signUpError.message.includes('user_already_exists')) {
        console.log('⚠️  Usuário já existe. Tentando fazer login...');
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: CONFIG.email,
          password: CONFIG.password
        });

        if (signInError) {
          console.error('❌ Erro ao fazer login:', signInError.message);
          console.log('\n💡 Dica: O usuário pode já existir com uma senha diferente.');
          console.log('   Use o SQL Editor do Supabase para resetar a senha ou criar um novo usuário.');
          return;
        }

        console.log('✅ Login realizado com sucesso!');
        
        // Verificar e atualizar perfil
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', signInData.user.id)
          .single();

        if (profile) {
          if (profile.user_type !== 'mestre') {
            console.log('🔄 Atualizando tipo de usuário para mestre...');
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ user_type: 'mestre' })
              .eq('id', signInData.user.id);

            if (updateError) {
              console.error('❌ Erro ao atualizar perfil:', updateError.message);
            } else {
              console.log('✅ Perfil atualizado para mestre!');
            }
          } else {
            console.log('✅ Usuário já é mestre!');
          }
        } else {
          console.log('⚠️  Perfil não encontrado. Criando perfil...');
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: signInData.user.id,
              email: CONFIG.email,
              full_name: CONFIG.fullName,
              user_type: 'mestre',
              phone: CONFIG.phone || ''
            });

          if (insertError) {
            console.error('❌ Erro ao criar perfil:', insertError.message);
          } else {
            console.log('✅ Perfil criado!');
          }
        }

        console.log('\n✅ Usuário mestre configurado com sucesso!');
        console.log('\n📋 Credenciais de acesso:');
        console.log(`   Email: ${CONFIG.email}`);
        console.log(`   Senha: ${CONFIG.password}`);
        console.log('\n🔗 Acesse: http://localhost:8080/login');
        return;
      }

      console.error('❌ Erro ao criar usuário:', signUpError.message);
      return;
    }

    if (signUpData.user) {
      console.log('✅ Usuário criado com sucesso!');
      console.log(`   ID: ${signUpData.user.id}`);
      
      // Aguardar um pouco para o trigger criar o perfil
      console.log('⏳ Aguardando criação automática do perfil...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verificar se o perfil foi criado
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signUpData.user.id)
        .single();

      if (profile) {
        console.log('✅ Perfil criado automaticamente!');
        console.log(`   Tipo: ${profile.user_type}`);
        console.log(`   Nome: ${profile.full_name}`);
      } else if (profileError) {
        console.log('⚠️  Perfil não foi criado automaticamente. Criando manualmente...');
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: signUpData.user.id,
            email: CONFIG.email,
            full_name: CONFIG.fullName,
            user_type: 'mestre',
            phone: CONFIG.phone || ''
          });

        if (insertError) {
          console.error('❌ Erro ao criar perfil:', insertError.message);
        } else {
          console.log('✅ Perfil criado manualmente!');
        }
      }

      if (!signUpData.session) {
        console.log('\n⚠️  IMPORTANTE: Verifique seu email para confirmar a conta!');
        console.log('   Ou use o SQL Editor do Supabase para confirmar manualmente.');
      }

      console.log('\n✅ Usuário mestre criado com sucesso!');
      console.log('\n📋 Credenciais de acesso:');
      console.log(`   Email: ${CONFIG.email}`);
      console.log(`   Senha: ${CONFIG.password}`);
      console.log('\n🔗 Acesse: http://localhost:8080/login');
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar
criarUsuarioMestre();

